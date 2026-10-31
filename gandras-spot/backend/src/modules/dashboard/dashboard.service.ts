import { Injectable } from '@nestjs/common';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { orderDisplayId } from '../orders/order-display.util';

@Injectable()
export class DashboardService {
  constructor(
    private orders: OrdersService,
    private prisma: PrismaService,
  ) {}

  async getDashboard(restaurantId: string) {
    const today = await this.orders.todayStats(restaurantId);
    const revenueByDay = await this.revenueLast7Days(restaurantId);
    const recentOrders = await this.prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        displayRef: true,
        publicToken: true,
        status: true,
        total: true,
        customerFirstName: true,
        customerPhone: true,
        deliveryMethod: true,
        paymentMethod: true,
        createdAt: true,
      },
    });

    const yesterday = await this.orders.statsForRange(
      restaurantId,
      startOfDay(subDays(new Date(), 1)),
      endOfDay(subDays(new Date(), 1)),
    );
    const revenueChange =
      yesterday.revenue > 0
        ? ((today.revenue - yesterday.revenue) / yesterday.revenue) * 100
        : today.revenue > 0
          ? 100
          : 0;

    return {
      stats: {
        totalOrders: today.totalOrders,
        activeOrders: today.activeOrders,
        completedOrders: today.completedOrders,
        cancelledOrders: today.cancelledOrders,
        revenue: today.revenue,
        revenueChangePercent: Math.round(revenueChange * 10) / 10,
        avgOrderValue: today.avgOrderValue,
        deliveries: today.deliveries,
        pickups: today.pickups,
        topProducts: today.topProducts,
      },
      revenueByDay,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        displayId: orderDisplayId(o.displayRef, o.orderNumber),
        token: o.publicToken,
        status: o.status,
        total: o.total,
        customer: { firstName: o.customerFirstName, phone: o.customerPhone },
        deliveryMethod: o.deliveryMethod,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      })),
    };
  }

  private async revenueLast7Days(restaurantId: string) {
    const days: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const stats = await this.orders.statsForRange(
        restaurantId,
        startOfDay(day),
        endOfDay(day),
      );
      days.push({
        label: format(day, 'EEE'),
        revenue: stats.revenue,
        orders: stats.completedOrders,
      });
    }
    return days;
  }

  async topCustomers(restaurantId: string, limit = 10) {
    return this.prisma.customer.findMany({
      where: { restaurantId },
      orderBy: { totalSpent: 'desc' },
      take: limit,
      include: { orders: { take: 5, orderBy: { createdAt: 'desc' } } },
    });
  }
}
