import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async list(restaurantId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { restaurantId },
      orderBy: { totalSpent: 'desc' },
      include: {
        orders: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true, total: true },
        },
      },
    });

    return customers.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      orderCount: c.orderCount,
      totalSpent: c.totalSpent,
      avgCheck: c.orderCount > 0 ? Math.round(c.totalSpent / c.orderCount) : 0,
      lastOrderAt: c.orders[0]?.createdAt ?? null,
      createdAt: c.createdAt,
    }));
  }

  findOne(restaurantId: string, id: string) {
    return this.prisma.customer.findFirst({
      where: { id, restaurantId },
      include: {
        addresses: true,
        orders: { orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
