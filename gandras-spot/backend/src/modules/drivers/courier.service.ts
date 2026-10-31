import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryMethod,
  DriverStatus,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { orderDisplayId } from '../orders/order-display.util';

function mapDeliveryOrder(o: Prisma.OrderGetPayload<{ include: { items: true } }>) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    displayId: orderDisplayId(o.displayRef, o.orderNumber),
    status: o.status,
    driverId: o.driverId,
    customerFirstName: o.customerFirstName,
    customerLastName: o.customerLastName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    customerCity: o.customerCity,
    customerNote: o.customerNote,
    total: o.total,
    deliveryFee: o.deliveryFee,
    completedAt: o.completedAt,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      totalPrice: i.totalPrice,
      kind: i.kind,
      options: i.options,
    })),
  };
}

@Injectable()
export class CourierService {
  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
  ) {}

  private async resolveDriver(restaurantId: string, userId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { restaurantId, userId, isActive: true },
      include: { restaurant: { include: { settings: true } } },
    });
    if (!driver) {
      throw new NotFoundException('Nalog nije povezan sa dostavljačem. Kontaktirajte admina.');
    }
    return driver;
  }

  private payPerDelivery(driver: { payPerDelivery: number | null }) {
    return driver.payPerDelivery ?? 0;
  }

  async profile(restaurantId: string, userId: string) {
    const driver = await this.resolveDriver(restaurantId, userId);
    const pay = this.payPerDelivery(driver);
    return {
      id: driver.id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
      status: driver.status,
      payPerDelivery: pay,
    };
  }

  async dashboard(restaurantId: string, userId: string) {
    const driver = await this.resolveDriver(restaurantId, userId);
    const pay = this.payPerDelivery(driver);

    const [queue, active, earnings] = await Promise.all([
      // Spremne + one koje je admin stavio „Na dostavi“ bez kurira (driverId null)
      this.prisma.order.findMany({
        where: {
          restaurantId,
          deliveryMethod: DeliveryMethod.DELIVERY,
          driverId: null,
          status: { in: [OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY] },
        },
        include: { items: true },
        orderBy: { estimatedReadyAt: 'asc' },
      }),
      this.prisma.order.findMany({
        where: {
          restaurantId,
          deliveryMethod: DeliveryMethod.DELIVERY,
          status: OrderStatus.OUT_FOR_DELIVERY,
          driverId: driver.id,
        },
        include: { items: true },
        orderBy: { estimatedReadyAt: 'asc' },
      }),
      this.earnings(restaurantId, userId),
    ]);

    return {
      driver: {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        status: driver.status,
        payPerDelivery: pay,
      },
      queue: queue.map(mapDeliveryOrder),
      active: active.map(mapDeliveryOrder),
      earnings,
    };
  }

  async earnings(restaurantId: string, userId: string) {
    const driver = await this.resolveDriver(restaurantId, userId);
    const pay = this.payPerDelivery(driver);
    const now = new Date();

    const periods = [
      { key: 'today' as const, from: startOfDay(now), to: endOfDay(now) },
      { key: 'week' as const, from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) },
      { key: 'month' as const, from: startOfMonth(now), to: endOfDay(now) },
    ];

    const result: Record<string, { count: number; total: number; deliveries: Array<{
      id: string;
      displayId: string;
      completedAt: string;
      customerAddress: string | null;
      customerCity: string | null;
      pay: number;
    }> }> = {};

    for (const period of periods) {
      const orders = await this.prisma.order.findMany({
        where: {
          restaurantId,
          driverId: driver.id,
          deliveryMethod: DeliveryMethod.DELIVERY,
          status: OrderStatus.COMPLETED,
          completedAt: { gte: period.from, lte: period.to },
        },
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          displayRef: true,
          completedAt: true,
          customerAddress: true,
          customerCity: true,
        },
      });

      result[period.key] = {
        count: orders.length,
        total: orders.length * pay,
        deliveries: orders.map((o) => ({
          id: o.id,
          displayId: orderDisplayId(o.displayRef, o.orderNumber),
          completedAt: o.completedAt!.toISOString(),
          customerAddress: o.customerAddress,
          customerCity: o.customerCity,
          pay,
        })),
      };
    }

    return {
      payPerDelivery: pay,
      today: result.today,
      week: result.week,
      month: result.month,
    };
  }

  async claim(restaurantId: string, userId: string, orderId: string) {
    const driver = await this.resolveDriver(restaurantId, userId);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
        deliveryMethod: DeliveryMethod.DELIVERY,
        driverId: null,
        status: { in: [OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY] },
      },
    });
    if (!order) {
      throw new BadRequestException('Porudžbina nije dostupna za preuzimanje');
    }

    await this.orders.updateStatus(
      restaurantId,
      orderId,
      { status: OrderStatus.OUT_FOR_DELIVERY, driverId: driver.id },
      userId,
    );

    await this.prisma.driver.update({
      where: { id: driver.id },
      data: { status: DriverStatus.BUSY },
    });

    return this.dashboard(restaurantId, userId);
  }

  async complete(restaurantId: string, userId: string, orderId: string) {
    const driver = await this.resolveDriver(restaurantId, userId);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
        driverId: driver.id,
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
    });
    if (!order) {
      throw new BadRequestException('Porudžbina nije dodeljena vama ili nije na dostavi');
    }

    await this.orders.updateStatus(
      restaurantId,
      orderId,
      { status: OrderStatus.COMPLETED },
      userId,
    );

    const activeLeft = await this.prisma.order.count({
      where: {
        restaurantId,
        driverId: driver.id,
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
    });

    if (activeLeft === 0) {
      await this.prisma.driver.update({
        where: { id: driver.id },
        data: { status: DriverStatus.ONLINE },
      });
    }

    return this.dashboard(restaurantId, userId);
  }

  async setStatus(restaurantId: string, userId: string, status: DriverStatus) {
    const driver = await this.resolveDriver(restaurantId, userId);
    if (status === DriverStatus.OFFLINE) {
      const active = await this.prisma.order.count({
        where: {
          restaurantId,
          driverId: driver.id,
          status: OrderStatus.OUT_FOR_DELIVERY,
        },
      });
      if (active > 0) {
        throw new BadRequestException('Ne možete se odjaviti dok imate aktivnu dostavu');
      }
    }
    await this.prisma.driver.update({ where: { id: driver.id }, data: { status } });
    return this.profile(restaurantId, userId);
  }
}
