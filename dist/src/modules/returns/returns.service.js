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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const payments_service_1 = require("../payments/payments.service");
const returns_utils_1 = require("./returns.utils");
const RETURN_INCLUDE = {
    items: {
        include: {
            orderItem: {
                select: {
                    id: true,
                    productName: true,
                    sku: true,
                    quantity: true,
                    unitPrice: true,
                },
            },
            product: { select: { id: true, name: true, sku: true, trackQuantity: true } },
        },
    },
    order: { select: { id: true, orderNumber: true, status: true, grandTotal: true } },
    customer: { select: { id: true, email: true, firstName: true, lastName: true } },
};
const INVALID_ORDER_STATUSES_FOR_RETURN = [
    client_1.OrderStatus.PENDING,
    client_1.OrderStatus.CANCELLED,
];
let ReturnsService = class ReturnsService {
    prisma;
    auditLogsService;
    paymentsService;
    constructor(prisma, auditLogsService, paymentsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
        this.paymentsService = paymentsService;
    }
    formatReturn(r) {
        return {
            ...r,
            items: r.items?.map((item) => ({
                ...item,
                unitPriceSnapshot: item.unitPriceSnapshot != null ? Number(item.unitPriceSnapshot) : null,
                totalAmount: item.totalAmount != null ? Number(item.totalAmount) : null,
            })),
        };
    }
    async create(dto, actorUserId) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (INVALID_ORDER_STATUSES_FOR_RETURN.includes(order.status)) {
            throw new common_1.BadRequestException(`Cannot create a return for an order with status: ${order.status}`);
        }
        const activeStatuses = [
            client_1.ReturnStatus.REQUESTED,
            client_1.ReturnStatus.APPROVED,
            client_1.ReturnStatus.RECEIVED,
            client_1.ReturnStatus.REFUND_PENDING,
            client_1.ReturnStatus.REFUNDED,
            client_1.ReturnStatus.COMPLETED,
        ];
        const existingReturnItems = await this.prisma.returnItem.findMany({
            where: {
                returnRequest: {
                    orderId: dto.orderId,
                    status: { in: activeStatuses },
                },
            },
            select: { orderItemId: true, quantity: true },
        });
        const errors = (0, returns_utils_1.validateReturnQuantities)(dto.items, order.items.map((oi) => ({ id: oi.id, quantity: oi.quantity })), existingReturnItems);
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors.join('; '));
        }
        const returnRequest = await this.prisma.returnRequest.create({
            data: {
                orderId: dto.orderId,
                customerId: dto.customerId ?? null,
                reason: dto.reason,
                notes: dto.notes ?? null,
                items: {
                    create: dto.items.map((item) => {
                        const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
                        const unitPrice = new client_1.Prisma.Decimal(orderItem.unitPrice.toString());
                        const totalAmount = unitPrice.mul(item.quantity);
                        return {
                            orderItemId: item.orderItemId,
                            productId: orderItem.productId ?? null,
                            quantity: item.quantity,
                            unitPriceSnapshot: unitPrice,
                            totalAmount,
                            reason: item.reason ?? null,
                        };
                    }),
                },
            },
            include: RETURN_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.created',
            entityType: 'ReturnRequest',
            entityId: returnRequest.id,
            metadata: {
                orderId: dto.orderId,
                itemCount: dto.items.length,
                reason: dto.reason,
            },
        });
        return this.formatReturn(returnRequest);
    }
    async findAll(query) {
        const { page = 1, limit = 50, orderId, orderNumber, status, customerId, dateFrom, dateTo, } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (orderId)
            where.orderId = orderId;
        if (orderNumber) {
            where.order = { orderNumber: { contains: orderNumber, mode: 'insensitive' } };
        }
        if (status)
            where.status = status;
        if (customerId)
            where.customerId = customerId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const [items, total] = await Promise.all([
            this.prisma.returnRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: RETURN_INCLUDE,
            }),
            this.prisma.returnRequest.count({ where }),
        ]);
        return {
            items: items.map((r) => this.formatReturn(r)),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const r = await this.prisma.returnRequest.findUnique({
            where: { id },
            include: RETURN_INCLUDE,
        });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        return this.formatReturn(r);
    }
    async approve(id, actorUserId) {
        const r = await this.prisma.returnRequest.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        (0, returns_utils_1.assertReturnStatusTransition)(r.status, client_1.ReturnStatus.APPROVED);
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: { status: client_1.ReturnStatus.APPROVED, approvedAt: new Date() },
            include: RETURN_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.approved',
            entityType: 'ReturnRequest',
            entityId: id,
            metadata: { orderId: r.orderId },
        });
        return this.formatReturn(updated);
    }
    async reject(id, dto, actorUserId) {
        const r = await this.prisma.returnRequest.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        (0, returns_utils_1.assertReturnStatusTransition)(r.status, client_1.ReturnStatus.REJECTED);
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: {
                status: client_1.ReturnStatus.REJECTED,
                rejectedAt: new Date(),
                ...(dto.notes != null && { notes: dto.notes }),
            },
            include: RETURN_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.rejected',
            entityType: 'ReturnRequest',
            entityId: id,
            metadata: { orderId: r.orderId, notes: dto.notes },
        });
        return this.formatReturn(updated);
    }
    async markReceived(id, actorUserId) {
        const r = await this.prisma.returnRequest.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, trackQuantity: true, stockQuantity: true } },
                    },
                },
            },
        });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        (0, returns_utils_1.assertReturnStatusTransition)(r.status, client_1.ReturnStatus.RECEIVED);
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedReturn = await tx.returnRequest.update({
                where: { id },
                data: { status: client_1.ReturnStatus.RECEIVED, receivedAt: new Date() },
                include: RETURN_INCLUDE,
            });
            const restockedItems = [];
            for (const item of r.items) {
                if (item.product?.trackQuantity) {
                    await tx.product.update({
                        where: { id: item.product.id },
                        data: { stockQuantity: { increment: item.quantity } },
                    });
                    restockedItems.push({ productId: item.product.id, qty: item.quantity });
                }
            }
            return { updatedReturn, restockedItems };
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.received',
            entityType: 'ReturnRequest',
            entityId: id,
            metadata: { orderId: r.orderId, restockedItems: updated.restockedItems },
        });
        if (updated.restockedItems.length > 0) {
            await this.auditLogsService.log({
                actorUserId,
                action: 'return.stock_restocked',
                entityType: 'ReturnRequest',
                entityId: id,
                metadata: { orderId: r.orderId, items: updated.restockedItems },
            });
        }
        return this.formatReturn(updated.updatedReturn);
    }
    async markRefundPending(id, actorUserId) {
        const r = await this.prisma.returnRequest.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        (0, returns_utils_1.assertReturnStatusTransition)(r.status, client_1.ReturnStatus.REFUND_PENDING);
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: { status: client_1.ReturnStatus.REFUND_PENDING },
            include: RETURN_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.refund_pending',
            entityType: 'ReturnRequest',
            entityId: id,
            metadata: { orderId: r.orderId },
        });
        return this.formatReturn(updated);
    }
    async refund(id, actorUserId) {
        const r = await this.prisma.returnRequest.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        if (r.status !== client_1.ReturnStatus.RECEIVED &&
            r.status !== client_1.ReturnStatus.REFUND_PENDING) {
            throw new common_1.BadRequestException(`Cannot refund from status: ${r.status}. Allowed: RECEIVED, REFUND_PENDING`);
        }
        const returnTotal = (0, returns_utils_1.calculateReturnTotal)(r.items);
        if (returnTotal.lte(0)) {
            throw new common_1.BadRequestException('Return total must be greater than 0');
        }
        const eligiblePayment = await this.prisma.payment.findFirst({
            where: {
                orderId: r.orderId,
                status: {
                    in: [client_1.PaymentRecordStatus.PAID, client_1.PaymentRecordStatus.PARTIALLY_REFUNDED],
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        if (!eligiblePayment) {
            throw new common_1.BadRequestException('No eligible paid payment found for this order');
        }
        const available = new client_1.Prisma.Decimal(eligiblePayment.amount.toString()).sub(new client_1.Prisma.Decimal(eligiblePayment.refundedAmount.toString()));
        if (returnTotal.greaterThan(available)) {
            throw new common_1.BadRequestException(`Refund amount ${returnTotal} exceeds available refundable amount ${available}`);
        }
        await this.paymentsService.refund(eligiblePayment.id, { amount: returnTotal.toNumber() }, actorUserId);
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: { status: client_1.ReturnStatus.REFUNDED },
            include: RETURN_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.refunded',
            entityType: 'ReturnRequest',
            entityId: id,
            metadata: {
                orderId: r.orderId,
                refundAmount: returnTotal.toNumber(),
                paymentId: eligiblePayment.id,
            },
        });
        return this.formatReturn(updated);
    }
    async complete(id, actorUserId) {
        const r = await this.prisma.returnRequest.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        (0, returns_utils_1.assertReturnStatusTransition)(r.status, client_1.ReturnStatus.COMPLETED);
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: { status: client_1.ReturnStatus.COMPLETED, completedAt: new Date() },
            include: RETURN_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.completed',
            entityType: 'ReturnRequest',
            entityId: id,
            metadata: { orderId: r.orderId },
        });
        return this.formatReturn(updated);
    }
    async cancel(id, actorUserId) {
        const r = await this.prisma.returnRequest.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Return request not found');
        (0, returns_utils_1.assertReturnStatusTransition)(r.status, client_1.ReturnStatus.CANCELLED);
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data: { status: client_1.ReturnStatus.CANCELLED },
            include: RETURN_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'return.cancelled',
            entityType: 'ReturnRequest',
            entityId: id,
            metadata: { orderId: r.orderId },
        });
        return this.formatReturn(updated);
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService,
        payments_service_1.PaymentsService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map