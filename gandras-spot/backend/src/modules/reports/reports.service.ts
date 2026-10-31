import { Injectable } from '@nestjs/common';
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  parseISO,
  isValid,
} from 'date-fns';
import ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '@prisma/client';

function resolveRange(from?: string, to?: string) {
  const start = from && isValid(parseISO(from))
    ? startOfDay(parseISO(from))
    : startOfMonth(new Date());
  const end = to && isValid(parseISO(to))
    ? endOfDay(parseISO(to))
    : from && isValid(parseISO(from))
      ? endOfDay(parseISO(from))
      : endOfMonth(new Date());
  return { start, end };
}

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
  ) {}

  async summary(restaurantId: string, from?: string, to?: string) {
    const { start, end } = resolveRange(from, to);
    const stats = await this.orders.statsForRange(restaurantId, start, end);
    const topCustomers = await this.prisma.customer.findMany({
      where: { restaurantId },
      orderBy: { totalSpent: 'desc' },
      take: 10,
    });
    const lowStock = await this.prisma.stockItem.findMany({ where: { restaurantId } });
    const lowStockItems = lowStock.filter((i) => i.quantity <= i.minQuantity);

    const ordersInPeriod = await this.prisma.order.findMany({
      where: { restaurantId, createdAt: { gte: start, lte: end }, status: OrderStatus.COMPLETED },
      select: { deliveryMethod: true, paymentMethod: true },
    });
    const deliveryCount = ordersInPeriod.filter((o) => o.deliveryMethod === 'DELIVERY').length;
    const pickupCount = ordersInPeriod.filter((o) => o.deliveryMethod === 'PICKUP').length;
    const cashCount = ordersInPeriod.filter((o) => o.paymentMethod === 'CASH').length;
    const cardCount = ordersInPeriod.filter((o) => o.paymentMethod === 'CARD').length;

    return {
      period: { from: start, to: end },
      ...stats,
      deliveryCount,
      pickupCount,
      cashCount,
      cardCount,
      topCustomers: topCustomers.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        totalSpent: c.totalSpent,
        orderCount: c.orderCount,
        avgCheck: c.orderCount > 0 ? Math.round(c.totalSpent / c.orderCount) : 0,
      })),
      lowStock: lowStockItems,
    };
  }

  async exportCsv(restaurantId: string, from?: string, to?: string) {
    const { start, end } = resolveRange(from, to);
    const orders = await this.prisma.order.findMany({
      where: { restaurantId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'asc' },
    });

    const header = 'orderNumber,date,status,total,customer,phone,delivery,payment\n';
    const rows = orders
      .map(
        (o) =>
          `${o.orderNumber},${o.createdAt.toISOString()},${o.status},${o.total},"${o.customerFirstName}",${o.customerPhone},${o.deliveryMethod},${o.paymentMethod}`,
      )
      .join('\n');
    return header + rows;
  }

  async exportExcel(restaurantId: string, from?: string, to?: string) {
    const { start, end } = resolveRange(from, to);
    const orders = await this.prisma.order.findMany({
      where: { restaurantId, createdAt: { gte: start, lte: end } },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Orders');
    sheet.columns = [
      { header: 'Broj', key: 'orderNumber', width: 10 },
      { header: 'Datum', key: 'createdAt', width: 22 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'Ukupno', key: 'total', width: 12 },
      { header: 'Kupac', key: 'customer', width: 20 },
      { header: 'Telefon', key: 'phone', width: 16 },
    ];
    for (const o of orders) {
      sheet.addRow({
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        total: o.total,
        customer: o.customerFirstName,
        phone: o.customerPhone,
      });
    }
    return wb.xlsx.writeBuffer();
  }
}
