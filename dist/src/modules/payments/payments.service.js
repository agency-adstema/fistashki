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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const payments_utils_1 = require("./payments.utils");
let PaymentsService = class PaymentsService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    formatPayment(p) {
        return {
            ...p,
            amount: p.amount != null ? Number(p.amount) : p.amount,
            refundedAmount: p.refundedAmount != null ? Number(p.refundedAmount) : p.refundedAmount,
        };
    }
    async create(dto, actorUserId) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot create payment for a cancelled order');
        }
        const amount = dto.amount != null
            ? new client_1.Prisma.Decimal(dto.amount)
            : order.grandTotal;
        const payment = await this.prisma.payment.create({
            data: {
                orderId: dto.orderId,
                method: dto.method,
                provider: dto.provider,
                providerTransactionId: dto.providerTransactionId,
                amount,
                currency: dto.currency ?? order.currency,
                metadata: dto.metadata,
            },
            include: { order: { select: { id: true, orderNumber: true } } },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'payment.created',
            entityType: 'Payment',
            entityId: payment.id,
            metadata: { orderId: dto.orderId, amount: Number(amount), method: dto.method },
        });
        return this.formatPayment(payment);
    }
    async findAll(query) {
        const { page = 1, limit = 50, orderId, orderNumber, status, method, provider, dateFrom, dateTo } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (orderId)
            where.orderId = orderId;
        if (orderNumber)
            where.order = { orderNumber: { contains: orderNumber, mode: 'insensitive' } };
        if (status)
            where.status = status;
        if (method)
            where.method = method;
        if (provider)
            where.provider = provider;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const [items, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { order: { select: { id: true, orderNumber: true } } },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            items: items.map((p) => this.formatPayment(p)),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { order: { select: { id: true, orderNumber: true, status: true, paymentStatus: true } } },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return this.formatPayment(payment);
    }
    async markPaid(id, dto, actorUserId) {
        const payment = await this.findOne(id);
        if (payment.status !== client_1.PaymentRecordStatus.PENDING &&
            payment.status !== client_1.PaymentRecordStatus.AUTHORIZED) {
            throw new common_1.BadRequestException(`Payment cannot be marked as paid from status: ${payment.status}`);
        }
        if (payment.order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot mark payment as paid for a cancelled order');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: { id },
                data: {
                    status: client_1.PaymentRecordStatus.PAID,
                    paidAt: new Date(),
                    ...(dto.providerTransactionId && { providerTransactionId: dto.providerTransactionId }),
                    ...(dto.metadata && { metadata: dto.metadata }),
                },
                include: { order: { select: { id: true, orderNumber: true } } },
            });
            await tx.order.update({
                where: { id: payment.orderId },
                data: { paymentStatus: client_1.PaymentStatus.PAID },
            });
            return updatedPayment;
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'payment.marked_paid',
            entityType: 'Payment',
            entityId: id,
            metadata: { orderId: payment.orderId, amount: payment.amount },
        });
        return this.formatPayment(updated);
    }
    async markFailed(id, dto, actorUserId) {
        const payment = await this.findOne(id);
        if (payment.status === client_1.PaymentRecordStatus.PAID ||
            payment.status === client_1.PaymentRecordStatus.REFUNDED ||
            payment.status === client_1.PaymentRecordStatus.PARTIALLY_REFUNDED) {
            throw new common_1.BadRequestException(`Payment cannot be marked as failed from status: ${payment.status}`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: { id },
                data: {
                    status: client_1.PaymentRecordStatus.FAILED,
                    failedAt: new Date(),
                    failureReason: dto.failureReason,
                },
                include: { order: { select: { id: true, orderNumber: true } } },
            });
            const paidCount = await tx.payment.count({
                where: { orderId: payment.orderId, status: client_1.PaymentRecordStatus.PAID, id: { not: id } },
            });
            if (paidCount === 0) {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: { paymentStatus: client_1.PaymentStatus.FAILED },
                });
            }
            return updatedPayment;
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'payment.marked_failed',
            entityType: 'Payment',
            entityId: id,
            metadata: { orderId: payment.orderId, failureReason: dto.failureReason },
        });
        return this.formatPayment(updated);
    }
    async refund(id, dto, actorUserId) {
        const payment = await this.findOne(id);
        if (payment.status !== client_1.PaymentRecordStatus.PAID &&
            payment.status !== client_1.PaymentRecordStatus.PARTIALLY_REFUNDED) {
            throw new common_1.BadRequestException(`Payment cannot be refunded from status: ${payment.status}`);
        }
        const paymentAmount = new client_1.Prisma.Decimal(payment.amount);
        const currentRefunded = new client_1.Prisma.Decimal(payment.refundedAmount);
        const refundAmount = dto.amount != null
            ? new client_1.Prisma.Decimal(dto.amount)
            : paymentAmount.sub(currentRefunded);
        const { newRefundedAmount, newStatus, refundedAt } = (0, payments_utils_1.calculateRefund)(paymentAmount, currentRefunded, refundAmount);
        const isFullRefund = newStatus === client_1.PaymentRecordStatus.REFUNDED;
        const updated = await this.prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: { id },
                data: {
                    status: newStatus,
                    refundedAmount: newRefundedAmount,
                    ...(refundedAt && { refundedAt }),
                },
                include: { order: { select: { id: true, orderNumber: true } } },
            });
            if (isFullRefund) {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: { paymentStatus: client_1.PaymentStatus.REFUNDED },
                });
            }
            return updatedPayment;
        });
        await this.auditLogsService.log({
            actorUserId,
            action: isFullRefund ? 'payment.refunded_full' : 'payment.refunded_partial',
            entityType: 'Payment',
            entityId: id,
            metadata: {
                orderId: payment.orderId,
                refundAmount: Number(refundAmount),
                totalRefunded: Number(newRefundedAmount),
            },
        });
        return this.formatPayment(updated);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map