import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponsQueryDto } from './dto/coupons-query.dto';
import { calculateDiscount } from './coupons.utils';

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private formatCoupon(c: any) {
    return {
      ...c,
      value: Number(c.value),
      minOrderAmount: c.minOrderAmount != null ? Number(c.minOrderAmount) : null,
      maxDiscountAmount: c.maxDiscountAmount != null ? Number(c.maxDiscountAmount) : null,
    };
  }

  async create(dto: CreateCouponDto, actorUserId?: string) {
    const code = dto.code.toUpperCase();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Coupon code '${code}' already exists`);

    if (new Date(dto.validFrom) >= new Date(dto.validTo)) {
      throw new BadRequestException('validFrom must be before validTo');
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        type: dto.type,
        value: new Prisma.Decimal(dto.value),
        currency: dto.currency ?? 'USD',
        minOrderAmount: dto.minOrderAmount != null ? new Prisma.Decimal(dto.minOrderAmount) : undefined,
        maxDiscountAmount: dto.maxDiscountAmount != null ? new Prisma.Decimal(dto.maxDiscountAmount) : undefined,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        isActive: dto.isActive ?? true,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'coupon.created',
      entityType: 'Coupon',
      entityId: coupon.id,
      metadata: { code: coupon.code, type: coupon.type },
    });

    return this.formatCoupon(coupon);
  }

  async findAll(query: CouponsQueryDto) {
    const { page = 1, limit = 50, type, isActive } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.CouponWhereInput = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.coupon.count({ where }),
    ]);

    return {
      items: items.map((c) => this.formatCoupon(c)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.formatCoupon(coupon);
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return this.formatCoupon(coupon);
  }

  async update(id: string, dto: UpdateCouponDto, actorUserId?: string) {
    await this.findOne(id);

    if (dto.code) {
      const conflict = await this.prisma.coupon.findFirst({
        where: { code: dto.code.toUpperCase(), id: { not: id } },
      });
      if (conflict) throw new ConflictException(`Coupon code '${dto.code}' already in use`);
    }

    const updated = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code.toUpperCase() }),
        ...(dto.type && { type: dto.type }),
        ...(dto.value !== undefined && { value: new Prisma.Decimal(dto.value) }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.minOrderAmount !== undefined && {
          minOrderAmount: dto.minOrderAmount != null ? new Prisma.Decimal(dto.minOrderAmount) : null,
        }),
        ...(dto.maxDiscountAmount !== undefined && {
          maxDiscountAmount: dto.maxDiscountAmount != null ? new Prisma.Decimal(dto.maxDiscountAmount) : null,
        }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.perUserLimit !== undefined && { perUserLimit: dto.perUserLimit }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.validFrom && { validFrom: new Date(dto.validFrom) }),
        ...(dto.validTo && { validTo: new Date(dto.validTo) }),
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'coupon.updated',
      entityType: 'Coupon',
      entityId: id,
      metadata: dto as any,
    });

    return this.formatCoupon(updated);
  }

  async remove(id: string, actorUserId?: string) {
    await this.findOne(id);
    await this.prisma.coupon.delete({ where: { id } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'coupon.deleted',
      entityType: 'Coupon',
      entityId: id,
      metadata: {},
    });

    return { deleted: true };
  }

  /**
   * Validates a coupon for use and returns the calculated discount amount.
   * Throws BadRequestException for any validation failure.
   */
  async validateForCart(
    code: string,
    subtotal: Prisma.Decimal,
    customerId?: string,
  ): Promise<{ coupon: ReturnType<CouponsService['formatCoupon']>; discount: Prisma.Decimal }> {
    const raw = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!raw) throw new NotFoundException('Coupon not found');
    if (!raw.isActive) throw new BadRequestException('Coupon is inactive');

    const now = new Date();
    if (now < raw.validFrom) throw new BadRequestException('Coupon is not yet valid');
    if (now > raw.validTo) throw new BadRequestException('Coupon has expired');

    if (raw.usageLimit != null && raw.usedCount >= raw.usageLimit) {
      throw new BadRequestException('Coupon usage limit has been reached');
    }

    if (raw.perUserLimit != null && customerId) {
      const customerUsage = await this.prisma.couponUsage.count({
        where: {
          couponId: raw.id,
          order: { customerId },
        },
      });
      if (customerUsage >= raw.perUserLimit) {
        throw new BadRequestException('You have reached the usage limit for this coupon');
      }
    }

    const discount = calculateDiscount(raw, subtotal);
    return { coupon: this.formatCoupon(raw), discount };
  }
}
