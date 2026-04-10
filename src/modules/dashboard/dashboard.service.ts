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
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

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
      revenueThisMonthAgg,
      ordersThisMonth,
      paidOrdersThisMonth,
      customersThisMonth,
      revenueLastMonthAgg,
      ordersLastMonth,
      paidOrdersLastMonth,
      customersLastMonth,
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
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint as count
        FROM products
        WHERE "trackQuantity" = true
          AND "isActive" = true
          AND "stockQuantity" <= "lowStockThreshold"
      `,
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID, createdAt: { gte: startOfToday } },
        _sum: { grandTotal: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.customer.count({ where: { createdAt: { gte: startOfToday } } }),
      // This month
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID, createdAt: { gte: startOfThisMonth } },
        _sum: { grandTotal: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      this.prisma.order.count({
        where: { paymentStatus: PaymentStatus.PAID, createdAt: { gte: startOfThisMonth } },
      }),
      this.prisma.customer.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      // Last month
      this.prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { grandTotal: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      this.prisma.order.count({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.customer.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
    ]);

    const pct = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    };

    const revenueThisMonth = Number(revenueThisMonthAgg._sum.grandTotal ?? 0);
    const revenueLastMonthVal = Number(revenueLastMonthAgg._sum.grandTotal ?? 0);

    const conversionRateThisMonth =
      ordersThisMonth > 0
        ? Math.round((paidOrdersThisMonth / ordersThisMonth) * 10000) / 100
        : 0;
    const conversionRateLastMonth =
      ordersLastMonth > 0
        ? Math.round((paidOrdersLastMonth / ordersLastMonth) * 10000) / 100
        : 0;

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
      revenueChangePercent: pct(revenueThisMonth, revenueLastMonthVal),
      ordersChangePercent: pct(ordersThisMonth, ordersLastMonth),
      customersChangePercent: pct(customersThisMonth, customersLastMonth),
      conversionRate: conversionRateThisMonth,
      conversionRateChange: Math.round((conversionRateThisMonth - conversionRateLastMonth) * 10) / 10,
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

  async getRevenueTrend(opts: {
    period?: '7d' | '30d' | '90d';
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    let from: Date;
    let to: Date;

    if (opts.dateFrom && opts.dateTo) {
      from = new Date(opts.dateFrom);
      from.setHours(0, 0, 0, 0);
      to = new Date(opts.dateTo);
      to.setHours(23, 59, 59, 999);
    } else {
      const days = opts.period === '7d' ? 7 : opts.period === '90d' ? 90 : 30;
      from = subDaysFromNow(days - 1);
      to = new Date();
    }

    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt: { gte: from, lte: to },
      },
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: 'asc' },
    });

    const map = new Map<string, { revenue: number; orders: number }>();
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      map.set(cursor.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
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

  /**
   * Daily paid revenue by calendar day for the current month vs the same calendar day
   * in the previous month (for Sales Overview chart).
   */
  async getSalesOverviewComparison() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const startThisMonth = new Date(y, m, 1, 0, 0, 0, 0);
    const endThisMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
    const startLastMonth = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const endLastMonth = new Date(y, m, 0, 23, 59, 59, 999);

    const daysInThisMonth = endThisMonth.getDate();
    const daysInLastMonth = endLastMonth.getDate();

    const [ordersThis, ordersLast] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startThisMonth, lte: now },
        },
        select: { createdAt: true, grandTotal: true },
      }),
      this.prisma.order.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startLastMonth, lte: endLastMonth },
        },
        select: { createdAt: true, grandTotal: true },
      }),
    ]);

    const thisByDay = new Map<number, number>();
    const lastByDay = new Map<number, number>();
    for (let d = 1; d <= daysInThisMonth; d++) thisByDay.set(d, 0);
    for (let d = 1; d <= daysInLastMonth; d++) lastByDay.set(d, 0);

    for (const o of ordersThis) {
      const dom = o.createdAt.getDate();
      thisByDay.set(dom, (thisByDay.get(dom) ?? 0) + Number(o.grandTotal));
    }
    for (const o of ordersLast) {
      const dom = o.createdAt.getDate();
      lastByDay.set(dom, (lastByDay.get(dom) ?? 0) + Number(o.grandTotal));
    }

    const monthShort = now.toLocaleString('en-US', { month: 'short' });
    const lastMonthDate = new Date(y, m - 1, 15);
    const lastMonthShort = lastMonthDate.toLocaleString('en-US', { month: 'short' });

    const points: Array<{
      day: number;
      label: string;
      thisMonth: number;
      lastMonth: number;
    }> = [];

    for (let day = 1; day <= daysInThisMonth; day++) {
      const pad = day < 10 ? `0${day}` : String(day);
      const label = `${pad} ${monthShort}`;
      const thisMonth = Math.round((thisByDay.get(day) ?? 0) * 100) / 100;
      const lastMonth =
        day <= daysInLastMonth
          ? Math.round((lastByDay.get(day) ?? 0) * 100) / 100
          : 0;

      points.push({ day, label, thisMonth, lastMonth });
    }

    return {
      thisMonthLabel: `${monthShort} ${y}`,
      lastMonthLabel: `${lastMonthShort} ${lastMonthDate.getFullYear()}`,
      points,
    };
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
