import { Injectable } from '@nestjs/common';
import { Prisma, PaymentStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

function subDaysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

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

  async getRevenueTrend(period: '7d' | '30d' | '90d' = '30d') {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const from = subDaysFromNow(days - 1);

    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt: { gte: from },
      },
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build a map: date string => { revenue, orders }
    const map = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < days; i++) {
      const d = subDaysFromNow(days - 1 - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { revenue: 0, orders: 0 });
    }

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (map.has(key)) {
        const entry = map.get(key)!;
        entry.revenue += Number(o.grandTotal);
        entry.orders += 1;
      }
    }

    return Array.from(map.entries()).map(([date, val]) => ({
      date,
      revenue: Math.round(val.revenue * 100) / 100,
      orders: val.orders,
    }));
  }

  async getTopProducts(limit = 10) {
    const rows = await this.prisma.$queryRaw<
      Array<{
        productId: string;
        productName: string;
        sku: string;
        totalRevenue: Prisma.Decimal;
        totalQuantity: bigint;
        orderCount: bigint;
      }>
    >`
      SELECT
        oi."productId",
        oi."productName",
        oi."sku",
        SUM(oi."totalPrice")::numeric      AS "totalRevenue",
        SUM(oi."quantity")::bigint         AS "totalQuantity",
        COUNT(DISTINCT oi."orderId")::bigint AS "orderCount"
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      WHERE o."paymentStatus" = 'PAID'
      GROUP BY oi."productId", oi."productName", oi."sku"
      ORDER BY "totalRevenue" DESC
      LIMIT ${limit}
    `;

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      sku: r.sku,
      totalRevenue: Number(r.totalRevenue),
      totalQuantity: Number(r.totalQuantity),
      orderCount: Number(r.orderCount),
    }));
  }

  async getTopCustomers(limit = 10) {
    const rows = await this.prisma.$queryRaw<
      Array<{
        customerId: string;
        firstName: string;
        lastName: string;
        email: string;
        totalSpend: Prisma.Decimal;
        orderCount: bigint;
      }>
    >`
      SELECT
        c.id          AS "customerId",
        c."firstName",
        c."lastName",
        c.email,
        SUM(o."grandTotal")::numeric   AS "totalSpend",
        COUNT(o.id)::bigint            AS "orderCount"
      FROM customers c
      INNER JOIN orders o ON o."customerId" = c.id
      WHERE o."paymentStatus" = 'PAID'
      GROUP BY c.id, c."firstName", c."lastName", c.email
      ORDER BY "totalSpend" DESC
      LIMIT ${limit}
    `;

    return rows.map((r) => ({
      customerId: r.customerId,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      totalSpend: Number(r.totalSpend),
      orderCount: Number(r.orderCount),
    }));
  }
}
