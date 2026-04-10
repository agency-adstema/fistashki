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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const orders_utils_1 = require("./orders.utils");
let OrdersService = class OrdersService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    formatOrder(order) {
        return {
            ...order,
            subtotal: order.subtotal != null ? Number(order.subtotal) : order.subtotal,
            discountTotal: order.discountTotal != null ? Number(order.discountTotal) : order.discountTotal,
            shippingTotal: order.shippingTotal != null ? Number(order.shippingTotal) : order.shippingTotal,
            grandTotal: order.grandTotal != null ? Number(order.grandTotal) : order.grandTotal,
            items: order.items
                ? order.items.map((item) => ({
                    ...item,
                    unitPrice: item.unitPrice != null ? Number(item.unitPrice) : item.unitPrice,
                    totalPrice: item.totalPrice != null ? Number(item.totalPrice) : item.totalPrice,
                }))
                : undefined,
        };
    }
    assertOrderStatusTransition(from, to) {
        const allowed = {
            [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.CONFIRMED]: [client_1.OrderStatus.PROCESSING, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.PROCESSING]: [client_1.OrderStatus.SHIPPED, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.SHIPPED]: [client_1.OrderStatus.DELIVERED],
            [client_1.OrderStatus.DELIVERED]: [client_1.OrderStatus.REFUNDED],
            [client_1.OrderStatus.CANCELLED]: [],
            [client_1.OrderStatus.REFUNDED]: [],
        };
        if (!allowed[from]?.includes(to)) {
            throw new common_1.BadRequestException(`Invalid order status transition: ${from} -> ${to}`);
        }
    }
    async create(dto, actorUserId) {
        const MAX_RETRIES = 3;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const order = await this.prisma.$transaction(async (tx) => {
                    const customer = await tx.customer.findUnique({
                        where: { id: dto.customerId },
                    });
                    if (!customer)
                        throw new common_1.NotFoundException('Customer not found');
                    if (dto.shippingAddressId) {
                        const address = await tx.customerAddress.findFirst({
                            where: { id: dto.shippingAddressId, customerId: dto.customerId },
                        });
                        if (!address) {
                            throw new common_1.NotFoundException('Shipping address not found or does not belong to customer');
                        }
                    }
                    const itemSnapshots = [];
                    for (const item of dto.items) {
                        const product = await tx.product.findUnique({
                            where: { id: item.productId },
                        });
                        if (!product)
                            throw new common_1.NotFoundException(`Product not found: ${item.productId}`);
                        if (!product.isActive) {
                            throw new common_1.BadRequestException(`Product is not available for ordering: ${product.name}`);
                        }
                        if (product.status !== client_1.ProductStatus.ACTIVE) {
                            throw new common_1.BadRequestException(`Product is not available for ordering: ${product.name}`);
                        }
                        const unitPrice = product.price;
                        const totalPrice = new client_1.Prisma.Decimal(unitPrice).mul(item.quantity);
                        itemSnapshots.push({
                            productId: product.id,
                            productName: product.name,
                            sku: product.sku,
                            unitPrice,
                            totalPrice,
                            quantity: item.quantity,
                            trackQuantity: product.trackQuantity,
                        });
                    }
                    const now = new Date();
                    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                    const todayOrderCount = await tx.order.count({
                        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
                    });
                    const orderNumber = (0, orders_utils_1.generateOrderNumber)(now, todayOrderCount + 1 + attempt);
                    const totals = (0, orders_utils_1.calculateOrderTotals)({
                        lineTotals: itemSnapshots.map((s) => s.totalPrice),
                        shippingTotal: dto.shippingTotal,
                        discountTotal: dto.discountTotal,
                    });
                    const createdOrder = await tx.order.create({
                        data: {
                            orderNumber,
                            customerId: dto.customerId,
                            shippingAddressId: dto.shippingAddressId,
                            notes: dto.notes,
                            subtotal: totals.subtotal,
                            discountTotal: totals.discountTotal,
                            shippingTotal: totals.shippingTotal,
                            grandTotal: totals.grandTotal,
                            currency: dto.currency ?? 'USD',
                            items: {
                                create: itemSnapshots.map((snap) => ({
                                    productId: snap.productId,
                                    productName: snap.productName,
                                    sku: snap.sku,
                                    quantity: snap.quantity,
                                    unitPrice: snap.unitPrice,
                                    totalPrice: snap.totalPrice,
                                })),
                            },
                        },
                        include: {
                            items: true,
                            customer: true,
                            shippingAddress: true,
                        },
                    });
                    for (const snap of itemSnapshots) {
                        if (snap.trackQuantity) {
                            const res = await tx.product.updateMany({
                                where: {
                                    id: snap.productId,
                                    stockQuantity: { gte: snap.quantity },
                                },
                                data: { stockQuantity: { decrement: snap.quantity } },
                            });
                            if (res.count === 0) {
                                throw new common_1.BadRequestException(`Insufficient stock for: ${snap.productName}`);
                            }
                        }
                    }
                    return createdOrder;
                });
                await this.auditLogsService.log({
                    actorUserId,
                    action: 'order.created',
                    entityType: 'Order',
                    entityId: order.id,
                    metadata: {
                        orderNumber: order.orderNumber,
                        customerId: order.customerId,
                        grandTotal: Number(order.grandTotal),
                    },
                });
                return this.formatOrder(order);
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException ||
                    err instanceof common_1.BadRequestException) {
                    throw err;
                }
                if (err?.code === 'P2002' || err?.code === 'P2034') {
                    continue;
                }
                throw err;
            }
        }
        throw new common_1.InternalServerErrorException('Failed to generate a unique order number after multiple attempts. Please try again.');
    }
    async findAll(query) {
        const { page = 1, limit = 50, search, status, paymentStatus, fulfillmentStatus, customerId, dateFrom, dateTo, assignedToUserId, priority, tagId, } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search)
            where.orderNumber = { contains: search, mode: 'insensitive' };
        if (status)
            where.status = status;
        if (paymentStatus)
            where.paymentStatus = paymentStatus;
        if (fulfillmentStatus)
            where.fulfillmentStatus = fulfillmentStatus;
        if (customerId)
            where.customerId = customerId;
        if (assignedToUserId)
            where.assignedToUserId = assignedToUserId;
        if (priority)
            where.priority = priority;
        if (tagId)
            where.tagAssignments = { some: { tagId } };
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const [items, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: {
                        select: { id: true, email: true, firstName: true, lastName: true },
                    },
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                    shippingAddress: true,
                    items: true,
                    tagAssignments: { include: { tag: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            items: items.map((o) => this.formatOrder(o)),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, email: true, firstName: true, lastName: true, phone: true },
                },
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                shippingAddress: true,
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, sku: true, slug: true, featuredImage: true },
                        },
                    },
                },
                tagAssignments: { include: { tag: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.formatOrder(order);
    }
    async updateStatus(id, dto, actorUserId) {
        const order = await this.findOne(id);
        if (order.status === dto.status) {
            throw new common_1.BadRequestException(`Order is already in status: ${dto.status}`);
        }
        this.assertOrderStatusTransition(order.status, dto.status);
        const updated = await this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
            include: {
                customer: { select: { id: true, email: true, firstName: true, lastName: true } },
                shippingAddress: true,
                items: true,
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.status.updated',
            entityType: 'Order',
            entityId: id,
            metadata: { from: order.status, to: dto.status },
        });
        return this.formatOrder(updated);
    }
    async updatePaymentStatus(id, dto, actorUserId) {
        const order = await this.findOne(id);
        if (dto.paymentStatus === client_1.PaymentStatus.REFUNDED &&
            order.status !== client_1.OrderStatus.DELIVERED &&
            order.status !== client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Payment status can only be set to REFUNDED when the order is DELIVERED or CANCELLED');
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: { paymentStatus: dto.paymentStatus },
            include: {
                customer: { select: { id: true, email: true, firstName: true, lastName: true } },
                shippingAddress: true,
                items: true,
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.payment_status.updated',
            entityType: 'Order',
            entityId: id,
            metadata: { from: order.paymentStatus, to: dto.paymentStatus },
        });
        return this.formatOrder(updated);
    }
    async updateFulfillmentStatus(id, dto, actorUserId) {
        const order = await this.findOne(id);
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update fulfillment status of a cancelled order');
        }
        if (dto.fulfillmentStatus === client_1.FulfillmentStatus.RETURNED &&
            order.fulfillmentStatus !== client_1.FulfillmentStatus.FULFILLED) {
            throw new common_1.BadRequestException('Fulfillment status can only be set to RETURNED when the order is FULFILLED');
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: { fulfillmentStatus: dto.fulfillmentStatus },
            include: {
                customer: { select: { id: true, email: true, firstName: true, lastName: true } },
                shippingAddress: true,
                items: true,
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.fulfillment_status.updated',
            entityType: 'Order',
            entityId: id,
            metadata: { from: order.fulfillmentStatus, to: dto.fulfillmentStatus },
        });
        return this.formatOrder(updated);
    }
    async cancelOrder(id, dto, actorUserId) {
        const order = await this.findOne(id);
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Order is already cancelled');
        }
        if (order.status === client_1.OrderStatus.SHIPPED || order.status === client_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Cannot cancel an order that has been shipped or delivered');
        }
        if (order.status === client_1.OrderStatus.REFUNDED) {
            throw new common_1.BadRequestException('Cannot cancel a refunded order');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const cancelledOrder = await tx.order.update({
                where: { id },
                data: {
                    status: client_1.OrderStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancelReason: dto.cancelReason,
                },
                include: {
                    customer: { select: { id: true, email: true, firstName: true, lastName: true } },
                    shippingAddress: true,
                    items: {
                        include: { product: true },
                    },
                },
            });
            for (const item of cancelledOrder.items) {
                if (item.product && item.product.trackQuantity) {
                    await tx.product.update({
                        where: { id: item.product.id },
                        data: { stockQuantity: { increment: item.quantity } },
                    });
                }
            }
            return cancelledOrder;
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.cancelled',
            entityType: 'Order',
            entityId: id,
            metadata: { orderNumber: order.orderNumber, cancelReason: dto.cancelReason },
        });
        return this.formatOrder(updated);
    }
    async deleteOrder(id, actorUserId) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true, orderNumber: true },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        await this.prisma.order.delete({ where: { id } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.deleted',
            entityType: 'Order',
            entityId: id,
            metadata: { orderNumber: order.orderNumber },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map