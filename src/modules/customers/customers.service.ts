import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AddressType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CustomersQueryDto } from './dto/customers-query.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateCustomerDto, actorUserId?: string) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) throw new ConflictException('Customer with this email already exists');

    const customer = await this.prisma.customer.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        notes: dto.notes,
        isActive: dto.isActive ?? true,
      },
      include: {
        addresses: true,
        _count: { select: { orders: true } },
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'customers.create',
      entityType: 'Customer',
      entityId: customer.id,
      metadata: { email: customer.email, firstName: customer.firstName, lastName: customer.lastName },
    });

    return customer;
  }

  async findAll(query: CustomersQueryDto) {
    const { page = 1, limit = 50, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          addresses: true,
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: { createdAt: 'asc' } },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            fulfillmentStatus: true,
            grandTotal: true,
            currency: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { orders: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    return {
      ...customer,
      orders: customer.orders.map((o) => ({
        ...o,
        grandTotal: Number(o.grandTotal),
      })),
    };
  }

  async update(id: string, dto: UpdateCustomerDto, actorUserId?: string) {
    await this.findOne(id);

    if (dto.email !== undefined) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        addresses: true,
        _count: { select: { orders: true } },
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'customers.update',
      entityType: 'Customer',
      entityId: customer.id,
      metadata: { changes: dto },
    });

    return customer;
  }

  async addAddress(customerId: string, dto: CreateAddressDto, actorUserId?: string) {
    await this.findOne(customerId);

    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId, type: dto.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.customerAddress.create({
      data: {
        customerId,
        type: dto.type,
        firstName: dto.firstName,
        lastName: dto.lastName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        isDefault: dto.isDefault ?? false,
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'customers.address.create',
      entityType: 'CustomerAddress',
      entityId: address.id,
      metadata: { customerId, type: address.type },
    });

    return address;
  }

  async getAddresses(customerId: string) {
    await this.findOne(customerId);

    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    dto: UpdateAddressDto,
    actorUserId?: string,
  ) {
    await this.findOne(customerId);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address) throw new NotFoundException('Address not found');

    const targetType = dto.type ?? address.type;

    if (dto.isDefault === true) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId, type: targetType, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.addressLine1 !== undefined && { addressLine1: dto.addressLine1 }),
        ...(dto.addressLine2 !== undefined && { addressLine2: dto.addressLine2 }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'customers.address.update',
      entityType: 'CustomerAddress',
      entityId: addressId,
      metadata: { customerId, changes: dto },
    });

    return updated;
  }

  async deleteAddress(customerId: string, addressId: string, actorUserId?: string) {
    await this.findOne(customerId);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.customerAddress.delete({ where: { id: addressId } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'customers.address.delete',
      entityType: 'CustomerAddress',
      entityId: addressId,
      metadata: { customerId },
    });

    return { id: addressId };
  }
}
