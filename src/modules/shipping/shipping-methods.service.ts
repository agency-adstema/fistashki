import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

@Injectable()
export class ShippingMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private formatMethod(m: any) {
    return { ...m, price: m.price != null ? Number(m.price) : m.price };
  }

  async create(dto: CreateShippingMethodDto, actorUserId?: string) {
    const existing = await this.prisma.shippingMethod.findUnique({ where: { key: dto.key } });
    if (existing) throw new ConflictException(`Shipping method key '${dto.key}' already exists`);

    const method = await this.prisma.shippingMethod.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        currency: dto.currency ?? 'USD',
        estimatedMinDays: dto.estimatedMinDays,
        estimatedMaxDays: dto.estimatedMaxDays,
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipping_method.created',
      entityType: 'ShippingMethod',
      entityId: method.id,
      metadata: { key: method.key, name: method.name },
    });

    return this.formatMethod(method);
  }

  async findAll(isActive?: boolean) {
    const where: Prisma.ShippingMethodWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;

    const methods = await this.prisma.shippingMethod.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return methods.map((m) => this.formatMethod(m));
  }

  async findOne(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Shipping method not found');
    return this.formatMethod(method);
  }

  async update(id: string, dto: UpdateShippingMethodDto, actorUserId?: string) {
    await this.findOne(id);

    if (dto.key) {
      const conflict = await this.prisma.shippingMethod.findFirst({
        where: { key: dto.key, id: { not: id } },
      });
      if (conflict) throw new ConflictException(`Shipping method key '${dto.key}' already in use`);
    }

    const updated = await this.prisma.shippingMethod.update({
      where: { id },
      data: {
        ...(dto.key && { key: dto.key }),
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: new Prisma.Decimal(dto.price) }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.estimatedMinDays !== undefined && { estimatedMinDays: dto.estimatedMinDays }),
        ...(dto.estimatedMaxDays !== undefined && { estimatedMaxDays: dto.estimatedMaxDays }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipping_method.updated',
      entityType: 'ShippingMethod',
      entityId: id,
      metadata: dto as any,
    });

    return this.formatMethod(updated);
  }

  async remove(id: string, actorUserId?: string) {
    await this.findOne(id);

    await this.prisma.shippingMethod.delete({ where: { id } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipping_method.deleted',
      entityType: 'ShippingMethod',
      entityId: id,
      metadata: {},
    });

    return { deleted: true };
  }
}
