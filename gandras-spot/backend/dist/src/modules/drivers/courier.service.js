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
exports.CourierService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma_service_1 = require("../../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
const order_display_util_1 = require("../orders/order-display.util");
function mapDeliveryOrder(o) {
    return {
        id: o.id,
        orderNumber: o.orderNumber,
        displayId: (0, order_display_util_1.orderDisplayId)(o.displayRef, o.orderNumber),
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
let CourierService = class CourierService {
    constructor(prisma, orders) {
        this.prisma = prisma;
        this.orders = orders;
    }
    async resolveDriver(restaurantId, userId) {
        const driver = await this.prisma.driver.findFirst({
            where: { restaurantId, userId, isActive: true },
            include: { restaurant: { include: { settings: true } } },
        });
        if (!driver) {
            throw new common_1.NotFoundException('Nalog nije povezan sa dostavljačem. Kontaktirajte admina.');
        }
        return driver;
    }
    payPerDelivery(driver) {
        return driver.payPerDelivery ?? 0;
    }
    async profile(restaurantId, userId) {
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
    async dashboard(restaurantId, userId) {
        const driver = await this.resolveDriver(restaurantId, userId);
        const pay = this.payPerDelivery(driver);
        const [queue, active, earnings] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    restaurantId,
                    deliveryMethod: client_1.DeliveryMethod.DELIVERY,
                    driverId: null,
                    status: { in: [client_1.OrderStatus.READY, client_1.OrderStatus.OUT_FOR_DELIVERY] },
                },
                include: { items: true },
                orderBy: { estimatedReadyAt: 'asc' },
            }),
            this.prisma.order.findMany({
                where: {
                    restaurantId,
                    deliveryMethod: client_1.DeliveryMethod.DELIVERY,
                    status: client_1.OrderStatus.OUT_FOR_DELIVERY,
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
    async earnings(restaurantId, userId) {
        const driver = await this.resolveDriver(restaurantId, userId);
        const pay = this.payPerDelivery(driver);
        const now = new Date();
        const periods = [
            { key: 'today', from: (0, date_fns_1.startOfDay)(now), to: (0, date_fns_1.endOfDay)(now) },
            { key: 'week', from: (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 }), to: (0, date_fns_1.endOfDay)(now) },
            { key: 'month', from: (0, date_fns_1.startOfMonth)(now), to: (0, date_fns_1.endOfDay)(now) },
        ];
        const result = {};
        for (const period of periods) {
            const orders = await this.prisma.order.findMany({
                where: {
                    restaurantId,
                    driverId: driver.id,
                    deliveryMethod: client_1.DeliveryMethod.DELIVERY,
                    status: client_1.OrderStatus.COMPLETED,
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
                    displayId: (0, order_display_util_1.orderDisplayId)(o.displayRef, o.orderNumber),
                    completedAt: o.completedAt.toISOString(),
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
    async claim(restaurantId, userId, orderId) {
        const driver = await this.resolveDriver(restaurantId, userId);
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                restaurantId,
                deliveryMethod: client_1.DeliveryMethod.DELIVERY,
                driverId: null,
                status: { in: [client_1.OrderStatus.READY, client_1.OrderStatus.OUT_FOR_DELIVERY] },
            },
        });
        if (!order) {
            throw new common_1.BadRequestException('Porudžbina nije dostupna za preuzimanje');
        }
        await this.orders.updateStatus(restaurantId, orderId, { status: client_1.OrderStatus.OUT_FOR_DELIVERY, driverId: driver.id }, userId);
        await this.prisma.driver.update({
            where: { id: driver.id },
            data: { status: client_1.DriverStatus.BUSY },
        });
        return this.dashboard(restaurantId, userId);
    }
    async complete(restaurantId, userId, orderId) {
        const driver = await this.resolveDriver(restaurantId, userId);
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                restaurantId,
                driverId: driver.id,
                status: client_1.OrderStatus.OUT_FOR_DELIVERY,
            },
        });
        if (!order) {
            throw new common_1.BadRequestException('Porudžbina nije dodeljena vama ili nije na dostavi');
        }
        await this.orders.updateStatus(restaurantId, orderId, { status: client_1.OrderStatus.COMPLETED }, userId);
        const activeLeft = await this.prisma.order.count({
            where: {
                restaurantId,
                driverId: driver.id,
                status: client_1.OrderStatus.OUT_FOR_DELIVERY,
            },
        });
        if (activeLeft === 0) {
            await this.prisma.driver.update({
                where: { id: driver.id },
                data: { status: client_1.DriverStatus.ONLINE },
            });
        }
        return this.dashboard(restaurantId, userId);
    }
    async setStatus(restaurantId, userId, status) {
        const driver = await this.resolveDriver(restaurantId, userId);
        if (status === client_1.DriverStatus.OFFLINE) {
            const active = await this.prisma.order.count({
                where: {
                    restaurantId,
                    driverId: driver.id,
                    status: client_1.OrderStatus.OUT_FOR_DELIVERY,
                },
            });
            if (active > 0) {
                throw new common_1.BadRequestException('Ne možete se odjaviti dok imate aktivnu dostavu');
            }
        }
        await this.prisma.driver.update({ where: { id: driver.id }, data: { status } });
        return this.profile(restaurantId, userId);
    }
};
exports.CourierService = CourierService;
exports.CourierService = CourierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], CourierService);
//# sourceMappingURL=courier.service.js.map