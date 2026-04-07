import { Injectable } from '@nestjs/common';
import { Prisma, PaymentStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueAggregate,
      totalPendingOrders,
      totalCancelledOrders,
      lowStockRaw,
      revenueTodayAggregate,
      ordersToday,
      customersToday,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.customer.count(),
      this.prisma.product.count(),
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { grandTotal: true },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      // Cross-column comparison (stockQuantity <= lowStockThreshold) requires raw SQL
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count
        FROM products
        WHERE "trackQuantity" = true
          AND "isActive" = true
          AND "stockQuantity" <= "lowStockThreshold"
      `,
      this.prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startOfToday },
        },
        _sum: { grandTotal: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.customer.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

    return {
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue: Number(revenueAggregate._sum.grandTotal ?? 0),
      totalPendingOrders,
      totalCancelledOrders,
      totalLowStockProducts: Number((lowStockRaw as [{ count: bigint }])[0].count),
      revenueToday: Number(revenueTodayAggregate._sum.grandTotal ?? 0),
      ordersToday,
      customersToday,
    };
  }

  async getLowStock() {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        sku: string;
        slug: string;
        stockQuantity: number;
        lowStockThreshold: number;
        price: Prisma.Decimal;
        isActive: boolean;
      }>
    >`
      SELECT id, name, sku, slug, "stockQuantity", "lowStockThreshold", price, "isActive"
      FROM products
      WHERE "trackQuantity" = true
        AND "isActive" = true
        AND "stockQuantity" <= "lowStockThreshold"
      ORDER BY "stockQuantity" ASC
    `;

    return rows.map((r) => ({
      ...r,
      price: Number(r.price),
      deficit: r.lowStockThreshold - r.stockQuantity,
    }));
  }

  async getRecentActivity(limit = 20) {
    const items = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
    return items;
  }
}
