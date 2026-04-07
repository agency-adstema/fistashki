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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const [totalOrders, totalCustomers, totalProducts, revenueAggregate, totalPendingOrders, totalCancelledOrders, lowStockRaw, revenueTodayAggregate, ordersToday, customersToday,] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.customer.count(),
            this.prisma.product.count(),
            this.prisma.order.aggregate({
                where: { paymentStatus: client_1.PaymentStatus.PAID },
                _sum: { grandTotal: true },
            }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.PENDING } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.CANCELLED } }),
            this.prisma.$queryRaw `
        SELECT COUNT(*)::bigint as count
        FROM products
        WHERE "trackQuantity" = true
          AND "isActive" = true
          AND "stockQuantity" <= "lowStockThreshold"
      `,
            this.prisma.order.aggregate({
                where: {
                    paymentStatus: client_1.PaymentStatus.PAID,
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
            totalLowStockProducts: Number(lowStockRaw[0].count),
            revenueToday: Number(revenueTodayAggregate._sum.grandTotal ?? 0),
            ordersToday,
            customersToday,
        };
    }
    async getLowStock() {
        const rows = await this.prisma.$queryRaw `
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map