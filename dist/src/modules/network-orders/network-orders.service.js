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
exports.NetworkOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
let NetworkOrdersService = class NetworkOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(networkKey, dto) {
        const networkName = await this.validateNetworkKey(networkKey);
        const existing = await this.prisma.networkOrder.findUnique({
            where: { externalId: dto.externalId },
        });
        if (existing) {
            throw new common_1.ConflictException(`Order ${dto.externalId} already exists in system`);
        }
        const networkOrder = await this.prisma.networkOrder.create({
            data: {
                networkKey,
                networkName,
                externalId: dto.externalId,
                customerEmail: dto.customerEmail,
                customerPhone: dto.customerPhone,
                customerName: dto.customerName,
                items: JSON.stringify(dto.items),
                totalAmount: dto.totalAmount,
                currency: dto.currency || 'RSD',
                notes: dto.notes,
                confirmationUrl: dto.confirmationUrl,
                webhookUrl: dto.webhookUrl,
                productsSku: dto.items.map((i) => i.sku),
                status: 'PENDING',
            },
        });
        return this.formatNetworkOrderResponse(networkOrder);
    }
    async confirmOrder(orderId, networkOrderId, dto) {
        const networkOrder = await this.prisma.networkOrder.findUnique({
            where: { id: networkOrderId },
            include: { order: true },
        });
        if (!networkOrder) {
            throw new common_1.NotFoundException(`Network order ${networkOrderId} not found`);
        }
        const updated = await this.prisma.networkOrder.update({
            where: { id: networkOrderId },
            data: {
                status: dto.status === 'CONFIRMED' ? 'CONFIRMED' : 'REJECTED',
                confirmedAt: new Date(),
            },
            include: { order: true },
        });
        if (updated.webhookUrl) {
            await this.sendWebhookNotification(updated.webhookUrl, {
                externalId: updated.externalId,
                status: updated.status,
                orderNumber: updated.order?.orderNumber,
                timestamp: new Date().toISOString(),
                message: dto.message || `Order ${updated.status.toLowerCase()}`,
            });
        }
        return this.formatNetworkOrderResponse(updated);
    }
    async getOrderByExternalId(externalId) {
        const order = await this.prisma.networkOrder.findUnique({
            where: { externalId },
            include: { order: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${externalId} not found`);
        }
        return this.formatNetworkOrderResponse(order);
    }
    async listOrders(status, networkKey) {
        const where = {};
        if (status)
            where.status = status;
        if (networkKey)
            where.networkKey = networkKey;
        return this.prisma.networkOrder.findMany({
            where,
            include: { order: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async validateNetworkKey(key) {
        if (!key || !key.startsWith('nk_')) {
            throw new common_1.BadRequestException('Invalid network API key format');
        }
        const parts = key.split('_');
        if (parts.length < 3) {
            throw new common_1.BadRequestException('Invalid network API key format');
        }
        return parts[1];
    }
    async sendWebhookNotification(webhookUrl, payload) {
        try {
            await axios_1.default.post(webhookUrl, payload, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Adstema-Signature': this.generateSignature(payload),
                },
            });
        }
        catch (error) {
            console.error(`[NetworkOrders] Webhook failed for ${webhookUrl}:`, error.message);
        }
    }
    generateSignature(payload) {
        const crypto = require('crypto');
        const secret = process.env.NETWORK_WEBHOOK_SECRET || 'dev-secret';
        return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    }
    formatNetworkOrderResponse(order) {
        return {
            id: order.id,
            externalId: order.externalId,
            status: order.status,
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            totalAmount: Number(order.totalAmount),
            currency: order.currency,
            createdAt: order.createdAt,
            confirmedAt: order.confirmedAt,
            order: order.order
                ? {
                    id: order.order.id,
                    orderNumber: order.order.orderNumber,
                    status: order.order.status,
                }
                : undefined,
        };
    }
};
exports.NetworkOrdersService = NetworkOrdersService;
exports.NetworkOrdersService = NetworkOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NetworkOrdersService);
//# sourceMappingURL=network-orders.service.js.map