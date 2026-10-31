import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async listSuppliers(restaurantId: string) {
    return this.prisma.supplier.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' },
      include: {
        stockItems: true,
        _count: { select: { deliveries: true } },
      },
    });
  }

  async createSupplier(restaurantId: string, data: { name: string; phone?: string; email?: string; note?: string }) {
    return this.prisma.supplier.create({
      data: { restaurantId, ...data },
    });
  }

  async updateSupplier(
    restaurantId: string,
    id: string,
    data: { name?: string; phone?: string; email?: string; note?: string },
  ) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id, restaurantId } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async listStock(restaurantId: string) {
    return this.prisma.stockItem.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' },
      include: { supplier: true, drink: true, extra: true },
    });
  }

  async createStockItem(
    restaurantId: string,
    data: {
      name: string;
      unit?: string;
      quantity?: number;
      minQuantity?: number;
      supplierId?: string;
      drinkId?: string;
      extraId?: string;
    },
  ) {
    return this.prisma.stockItem.create({
      data: {
        restaurantId,
        name: data.name,
        unit: data.unit ?? 'kom',
        quantity: data.quantity ?? 0,
        minQuantity: data.minQuantity ?? 10,
        supplierId: data.supplierId,
        drinkId: data.drinkId,
        extraId: data.extraId,
      },
      include: { supplier: true, drink: true, extra: true },
    });
  }

  async updateStockItem(
    restaurantId: string,
    id: string,
    data: {
      name?: string;
      quantity?: number;
      minQuantity?: number;
      supplierId?: string | null;
      unit?: string;
    },
  ) {
    const stock = await this.prisma.stockItem.findFirst({ where: { id, restaurantId } });
    if (!stock) throw new NotFoundException('Stock item not found');

    if (data.quantity !== undefined && data.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.quantity !== undefined && data.quantity !== stock.quantity) {
        const delta = data.quantity - stock.quantity;
        await tx.stockMovement.create({
          data: {
            stockItemId: id,
            change: delta,
            reason: 'ADJUSTMENT',
          },
        });
      }

      return tx.stockItem.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
          ...(data.minQuantity !== undefined ? { minQuantity: data.minQuantity } : {}),
          ...(data.supplierId !== undefined ? { supplierId: data.supplierId } : {}),
          ...(data.unit !== undefined ? { unit: data.unit } : {}),
        },
        include: { supplier: true, drink: true, extra: true },
      });
    });
  }

  async recordDelivery(
    restaurantId: string,
    supplierId: string,
    items: { stockItemId: string; quantity: number }[],
    note?: string,
  ) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: supplierId, restaurantId } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    return this.prisma.$transaction(async (tx) => {
      const delivery = await tx.stockDelivery.create({
        data: { supplierId, note },
      });

      for (const line of items) {
        const stock = await tx.stockItem.findFirst({
          where: { id: line.stockItemId, restaurantId },
        });
        if (!stock) throw new BadRequestException(`Stock item ${line.stockItemId} not found`);

        await tx.stockItem.update({
          where: { id: stock.id },
          data: { quantity: { increment: line.quantity } },
        });
        await tx.stockDeliveryLine.create({
          data: {
            deliveryId: delivery.id,
            stockItemId: stock.id,
            quantity: line.quantity,
          },
        });
        await tx.stockMovement.create({
          data: {
            stockItemId: stock.id,
            change: line.quantity,
            reason: 'DELIVERY',
          },
        });
      }

      return delivery;
    });
  }

  async deductForOrder(
    restaurantId: string,
    orderId: string,
    items: { kind?: string | null; options?: Prisma.JsonValue; quantity?: number }[],
  ) {
    for (const item of items) {
      const opts = (item.options ?? {}) as Record<string, string>;
      const qty = Math.max(1, item.quantity ?? 1);
      let stockItem = null;

      if (item.kind === 'drink' && opts.drinkId) {
        stockItem = await this.prisma.stockItem.findFirst({
          where: { restaurantId, drinkId: opts.drinkId },
        });
      } else if (item.kind === 'extra' && opts.extraId) {
        stockItem = await this.prisma.stockItem.findFirst({
          where: { restaurantId, extraId: opts.extraId },
        });
      }

      if (!stockItem || stockItem.quantity <= 0) continue;

      const decrement = Math.min(qty, stockItem.quantity);
      if (decrement <= 0) continue;

      await this.prisma.$transaction([
        this.prisma.stockItem.update({
          where: { id: stockItem.id },
          data: { quantity: { decrement } },
        }),
        this.prisma.stockMovement.create({
          data: {
            stockItemId: stockItem.id,
            change: -decrement,
            reason: 'ORDER',
            orderId,
          },
        }),
      ]);
    }
  }

  async lowStock(restaurantId: string) {
    const items = await this.prisma.stockItem.findMany({ where: { restaurantId } });
    return items.filter((i) => i.quantity <= i.minQuantity);
  }
}
