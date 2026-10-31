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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const exceljs_1 = __importDefault(require("exceljs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
const client_1 = require("@prisma/client");
function resolveRange(from, to) {
    const start = from && (0, date_fns_1.isValid)((0, date_fns_1.parseISO)(from))
        ? (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(from))
        : (0, date_fns_1.startOfMonth)(new Date());
    const end = to && (0, date_fns_1.isValid)((0, date_fns_1.parseISO)(to))
        ? (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(to))
        : from && (0, date_fns_1.isValid)((0, date_fns_1.parseISO)(from))
            ? (0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(from))
            : (0, date_fns_1.endOfMonth)(new Date());
    return { start, end };
}
let ReportsService = class ReportsService {
    constructor(prisma, orders) {
        this.prisma = prisma;
        this.orders = orders;
    }
    async summary(restaurantId, from, to) {
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
            where: { restaurantId, createdAt: { gte: start, lte: end }, status: client_1.OrderStatus.COMPLETED },
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
    async exportCsv(restaurantId, from, to) {
        const { start, end } = resolveRange(from, to);
        const orders = await this.prisma.order.findMany({
            where: { restaurantId, createdAt: { gte: start, lte: end } },
            orderBy: { createdAt: 'asc' },
        });
        const header = 'orderNumber,date,status,total,customer,phone,delivery,payment\n';
        const rows = orders
            .map((o) => `${o.orderNumber},${o.createdAt.toISOString()},${o.status},${o.total},"${o.customerFirstName}",${o.customerPhone},${o.deliveryMethod},${o.paymentMethod}`)
            .join('\n');
        return header + rows;
    }
    async exportExcel(restaurantId, from, to) {
        const { start, end } = resolveRange(from, to);
        const orders = await this.prisma.order.findMany({
            where: { restaurantId, createdAt: { gte: start, lte: end } },
            include: { items: true },
            orderBy: { createdAt: 'asc' },
        });
        const wb = new exceljs_1.default.Workbook();
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map