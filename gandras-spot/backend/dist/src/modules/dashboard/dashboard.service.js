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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const orders_service_1 = require("../orders/orders.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const order_display_util_1 = require("../orders/order-display.util");
let DashboardService = class DashboardService {
    constructor(orders, prisma) {
        this.orders = orders;
        this.prisma = prisma;
    }
    async getDashboard(restaurantId) {
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
        const yesterday = await this.orders.statsForRange(restaurantId, (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), 1)), (0, date_fns_1.endOfDay)((0, date_fns_1.subDays)(new Date(), 1)));
        const revenueChange = yesterday.revenue > 0
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
                displayId: (0, order_display_util_1.orderDisplayId)(o.displayRef, o.orderNumber),
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
    async revenueLast7Days(restaurantId) {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const day = (0, date_fns_1.subDays)(new Date(), i);
            const stats = await this.orders.statsForRange(restaurantId, (0, date_fns_1.startOfDay)(day), (0, date_fns_1.endOfDay)(day));
            days.push({
                label: (0, date_fns_1.format)(day, 'EEE'),
                revenue: stats.revenue,
                orders: stats.completedOrders,
            });
        }
        return days;
    }
    async topCustomers(restaurantId, limit = 10) {
        return this.prisma.customer.findMany({
            where: { restaurantId },
            orderBy: { totalSpent: 'desc' },
            take: limit,
            include: { orders: { take: 5, orderBy: { createdAt: 'desc' } } },
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map