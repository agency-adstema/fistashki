"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listSuppliers(restaurantId) {
        return this.prisma.supplier.findMany({
            where: { restaurantId },
            orderBy: { name: 'asc' },
            include: {
                stockItems: true,
                _count: { select: { deliveries: true } },
            },
        });
    }
    async createSupplier(restaurantId, data) {
        return this.prisma.supplier.create({
            data: { restaurantId, ...data },
        });
    }
    async updateSupplier(restaurantId, id, data) {
        const supplier = await this.prisma.supplier.findFirst({ where: { id, restaurantId } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }
    async listStock(restaurantId) {
        return this.prisma.stockItem.findMany({
            where: { restaurantId },
            orderBy: { name: 'asc' },
            include: { supplier: true, drink: true, extra: true },
        });
    }
    async createStockItem(restaurantId, data) {
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
    async updateStockItem(restaurantId, id, data) {
        const stock = await this.prisma.stockItem.findFirst({ where: { id, restaurantId } });
        if (!stock)
            throw new common_1.NotFoundException('Stock item not found');
        if (data.quantity !== undefined && data.quantity < 0) {
            throw new common_1.BadRequestException('Quantity cannot be negative');
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
    async recordDelivery(restaurantId, supplierId, items, note) {
        const supplier = await this.prisma.supplier.findFirst({ where: { id: supplierId, restaurantId } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return this.prisma.$transaction(async (tx) => {
            const delivery = await tx.stockDelivery.create({
                data: { supplierId, note },
            });
            for (const line of items) {
                const stock = await tx.stockItem.findFirst({
                    where: { id: line.stockItemId, restaurantId },
                });
                if (!stock)
                    throw new common_1.BadRequestException(`Stock item ${line.stockItemId} not found`);
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
    async deductForOrder(restaurantId, orderId, items) {
        for (const item of items) {
            const opts = (item.options ?? {});
            const qty = Math.max(1, item.quantity ?? 1);
            let stockItem = null;
            if (item.kind === 'drink' && opts.drinkId) {
                stockItem = await this.prisma.stockItem.findFirst({
                    where: { restaurantId, drinkId: opts.drinkId },
                });
            }
            else if (item.kind === 'extra' && opts.extraId) {
                stockItem = await this.prisma.stockItem.findFirst({
                    where: { restaurantId, extraId: opts.extraId },
                });
            }
            if (!stockItem || stockItem.quantity <= 0)
                continue;
            const decrement = Math.min(qty, stockItem.quantity);
            if (decrement <= 0)
                continue;
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
    async lowStock(restaurantId) {
        const items = await this.prisma.stockItem.findMany({ where: { restaurantId } });
        return items.filter((i) => i.quantity <= i.minQuantity);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map