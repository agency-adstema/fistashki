import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  list(restaurantId: string) {
    return this.prisma.coupon.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(restaurantId: string, data: Record<string, unknown>) {
    return this.prisma.coupon.create({
      data: {
        restaurantId,
        code: String(data.code).toUpperCase(),
        ...data,
      } as never,
    });
  }

  async update(restaurantId: string, id: string, data: Record<string, unknown>) {
    const result = await this.prisma.coupon.updateMany({
      where: { id, restaurantId },
      data: data as never,
    });
    if (!result.count) throw new NotFoundException();
    return this.prisma.coupon.findUnique({ where: { id } });
  }

  async remove(restaurantId: string, id: string) {
    await this.prisma.coupon.deleteMany({ where: { id, restaurantId } });
  }
}
