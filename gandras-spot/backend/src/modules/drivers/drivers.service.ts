import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  list(restaurantId: string) {
    return this.prisma.driver.findMany({
      where: { restaurantId, isActive: true },
      include: {
        user: { select: { id: true, email: true } },
        orders: {
          where: { status: { in: ['OUT_FOR_DELIVERY', 'READY'] } },
          select: { id: true, orderNumber: true, status: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async createCourierAccount(restaurantId: string, dto: CreateCourierDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email je već u upotrebi');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      await tx.restaurantUser.create({
        data: {
          restaurantId,
          userId: user.id,
          role: UserRole.COURIER,
        },
      });

      return tx.driver.create({
        data: {
          restaurantId,
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          payPerDelivery: dto.payPerDelivery,
          status: DriverStatus.OFFLINE,
        },
        include: { user: { select: { id: true, email: true } } },
      });
    });
  }

  create(restaurantId: string, data: Record<string, unknown>) {
    return this.prisma.driver.create({ data: { restaurantId, ...data } as never });
  }

  async update(restaurantId: string, id: string, data: Record<string, unknown>) {
    const result = await this.prisma.driver.updateMany({
      where: { id, restaurantId },
      data: data as never,
    });
    if (!result.count) throw new NotFoundException();
    return this.prisma.driver.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  setStatus(restaurantId: string, id: string, status: DriverStatus) {
    return this.update(restaurantId, id, { status });
  }

  async updateCourierAccount(restaurantId: string, id: string, dto: UpdateCourierDto) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, restaurantId, isActive: true },
      include: { user: true },
    });
    if (!driver) throw new NotFoundException();

    if (dto.email) {
      const email = dto.email.toLowerCase();
      const existing = await this.prisma.user.findFirst({
        where: {
          email,
          ...(driver.userId ? { id: { not: driver.userId } } : {}),
        },
      });
      if (existing) throw new BadRequestException('Email je već u upotrebi');
    }

    return this.prisma.$transaction(async (tx) => {
      const driverData: {
        firstName?: string;
        lastName?: string | null;
        phone?: string;
        payPerDelivery?: number | null;
      } = {};

      if (dto.firstName !== undefined) driverData.firstName = dto.firstName;
      if (dto.lastName !== undefined) driverData.lastName = dto.lastName || null;
      if (dto.phone !== undefined) driverData.phone = dto.phone;
      if (dto.payPerDelivery !== undefined) driverData.payPerDelivery = dto.payPerDelivery;

      if (driver.userId) {
        const userData: {
          email?: string;
          passwordHash?: string;
          firstName?: string;
          lastName?: string | null;
        } = {};

        if (dto.email) userData.email = dto.email.toLowerCase();
        if (dto.password) userData.passwordHash = await bcrypt.hash(dto.password, 10);
        if (dto.firstName !== undefined) userData.firstName = dto.firstName;
        if (dto.lastName !== undefined) userData.lastName = dto.lastName || null;

        if (Object.keys(userData).length > 0) {
          await tx.user.update({ where: { id: driver.userId }, data: userData });
        }
      }

      return tx.driver.update({
        where: { id },
        data: driverData,
        include: { user: { select: { id: true, email: true } } },
      });
    });
  }

  async remove(restaurantId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, restaurantId, isActive: true },
    });
    if (!driver) throw new NotFoundException();

    const activeOrders = await this.prisma.order.count({
      where: {
        driverId: id,
        status: { in: ['READY', 'OUT_FOR_DELIVERY'] },
      },
    });
    if (activeOrders > 0) {
      throw new BadRequestException('Kurir ima aktivne dostave. Završite ih pre brisanja.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: { isActive: false, status: DriverStatus.OFFLINE },
      });
      if (driver.userId) {
        await tx.user.update({
          where: { id: driver.userId },
          data: { isActive: false },
        });
      }
      return { id };
    });
  }
}
