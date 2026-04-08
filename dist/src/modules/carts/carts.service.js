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
exports.CartsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const coupons_service_1 = require("../coupons/coupons.service");
const carts_utils_1 = require("./carts.utils");
const orders_utils_1 = require("../orders/orders.utils");
const CART_INCLUDE = {
    items: {
        include: {
            product: { select: { id: true, name: true, sku: true, slug: true, status: true, isActive: true } },
        },
        orderBy: { createdAt: 'asc' },
    },
    customer: { select: { id: true, email: true, firstName: true, lastName: true } },
    shippingMethod: { select: { id: true, key: true, name: true, price: true } },
    coupon: { select: { id: true, code: true, type: true, value: true } },
};
let CartsService = class CartsService {
    prisma;
    auditLogsService;
    couponsService;
    constructor(prisma, auditLogsService, couponsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
        this.couponsService = couponsService;
    }
    formatCart(cart) {
        return {
            ...cart,
            subtotal: Number(cart.subtotal),
            discountTotal: Number(cart.discountTotal),
            shippingTotal: Number(cart.shippingTotal),
            grandTotal: Number(cart.grandTotal),
            items: cart.items?.map((item) => ({
                ...item,
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.totalPrice),
            })),
        };
    }
    assertCartEditable(cart) {
        if (cart.status !== client_1.CartStatus.ACTIVE) {
            throw new common_1.BadRequestException(`Cart cannot be modified in status: ${cart.status}`);
        }
    }
    async recomputeAndSave(tx, cartId, shippingTotal, discountTotal) {
        const items = await tx.cartItem.findMany({ where: { cartId } });
        const totals = (0, carts_utils_1.recalculateCartTotals)(items, shippingTotal, discountTotal);
        return tx.cart.update({
            where: { id: cartId },
            data: {
                subtotal: totals.subtotal,
                discountTotal: totals.discountTotal,
                shippingTotal: totals.shippingTotal,
                grandTotal: totals.grandTotal,
            },
            include: CART_INCLUDE,
        });
    }
    async create(dto, actorUserId) {
        if (dto.customerId) {
            const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
            if (!customer)
                throw new common_1.NotFoundException('Customer not found');
        }
        const cart = await this.prisma.cart.create({
            data: {
                customerId: dto.customerId,
                sessionId: dto.sessionId,
                currency: dto.currency ?? 'USD',
                notes: dto.notes,
            },
            include: CART_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.created',
            entityType: 'Cart',
            entityId: cart.id,
            metadata: { customerId: dto.customerId, sessionId: dto.sessionId },
        });
        return this.formatCart(cart);
    }
    async findAll(query) {
        const { page = 1, limit = 50, status, customerId, sessionId } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (customerId)
            where.customerId = customerId;
        if (sessionId)
            where.sessionId = sessionId;
        const [items, total] = await Promise.all([
            this.prisma.cart.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: CART_INCLUDE,
            }),
            this.prisma.cart.count({ where }),
        ]);
        return {
            items: items.map((c) => this.formatCart(c)),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const cart = await this.prisma.cart.findUnique({ where: { id }, include: CART_INCLUDE });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        return this.formatCart(cart);
    }
    async findBySessionId(sessionId) {
        const cart = await this.prisma.cart.findFirst({
            where: { sessionId, status: client_1.CartStatus.ACTIVE },
            include: CART_INCLUDE,
        });
        if (!cart)
            throw new common_1.NotFoundException('Active cart not found for this session');
        return this.formatCart(cart);
    }
    async addItem(cartId, dto, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (!product.isActive || product.status !== client_1.ProductStatus.ACTIVE) {
            throw new common_1.BadRequestException('Product is not available for purchase');
        }
        const existing = await this.prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId, productId: dto.productId } },
        });
        const newQty = existing ? existing.quantity + dto.quantity : dto.quantity;
        if (product.trackQuantity && product.stockQuantity < newQty) {
            throw new common_1.BadRequestException(`Insufficient stock. Available: ${product.stockQuantity}`);
        }
        const unitPrice = new client_1.Prisma.Decimal(product.price);
        const totalPrice = unitPrice.mul(newQty);
        const updatedCart = await this.prisma.$transaction(async (tx) => {
            await tx.cartItem.upsert({
                where: { cartId_productId: { cartId, productId: dto.productId } },
                update: { quantity: newQty, totalPrice },
                create: {
                    cartId,
                    productId: dto.productId,
                    quantity: newQty,
                    unitPrice,
                    totalPrice,
                },
            });
            return this.recomputeAndSave(tx, cartId, new client_1.Prisma.Decimal(cart.shippingTotal), new client_1.Prisma.Decimal(cart.discountTotal));
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.item_added',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { productId: dto.productId, quantity: dto.quantity },
        });
        return this.formatCart(updatedCart);
    }
    async updateItem(cartId, itemId, dto, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId } });
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        if (dto.quantity === 0) {
            return this.removeItem(cartId, itemId, actorUserId);
        }
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (product?.trackQuantity && product.stockQuantity < dto.quantity) {
            throw new common_1.BadRequestException(`Insufficient stock. Available: ${product.stockQuantity}`);
        }
        const unitPrice = new client_1.Prisma.Decimal(item.unitPrice);
        const totalPrice = unitPrice.mul(dto.quantity);
        const updatedCart = await this.prisma.$transaction(async (tx) => {
            await tx.cartItem.update({
                where: { id: itemId },
                data: { quantity: dto.quantity, totalPrice },
            });
            return this.recomputeAndSave(tx, cartId, new client_1.Prisma.Decimal(cart.shippingTotal), new client_1.Prisma.Decimal(cart.discountTotal));
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.item_updated',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { itemId, quantity: dto.quantity },
        });
        return this.formatCart(updatedCart);
    }
    async removeItem(cartId, itemId, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId } });
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        const updatedCart = await this.prisma.$transaction(async (tx) => {
            await tx.cartItem.delete({ where: { id: itemId } });
            return this.recomputeAndSave(tx, cartId, new client_1.Prisma.Decimal(cart.shippingTotal), new client_1.Prisma.Decimal(cart.discountTotal));
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.item_removed',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { itemId, productId: item.productId },
        });
        return this.formatCart(updatedCart);
    }
    async clearItems(cartId, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        await this.prisma.cartItem.deleteMany({ where: { cartId } });
        const updatedCart = await this.prisma.cart.update({
            where: { id: cartId },
            data: { subtotal: 0, grandTotal: new client_1.Prisma.Decimal(cart.shippingTotal).sub(new client_1.Prisma.Decimal(cart.discountTotal)).lessThan(0) ? new client_1.Prisma.Decimal(0) : new client_1.Prisma.Decimal(cart.shippingTotal).sub(new client_1.Prisma.Decimal(cart.discountTotal)) },
            include: CART_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.cleared',
            entityType: 'Cart',
            entityId: cartId,
            metadata: {},
        });
        return this.formatCart(updatedCart);
    }
    async assignCustomer(cartId, dto, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const updated = await this.prisma.cart.update({
            where: { id: cartId },
            data: { customerId: dto.customerId },
            include: CART_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.customer_assigned',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { customerId: dto.customerId },
        });
        return this.formatCart(updated);
    }
    async assignShippingMethod(cartId, dto, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const method = await this.prisma.shippingMethod.findUnique({
            where: { id: dto.shippingMethodId },
        });
        if (!method)
            throw new common_1.NotFoundException('Shipping method not found');
        if (!method.isActive)
            throw new common_1.BadRequestException('Shipping method is inactive');
        const updatedCart = await this.prisma.$transaction(async (tx) => {
            await tx.cart.update({
                where: { id: cartId },
                data: { shippingMethodId: dto.shippingMethodId, shippingTotal: method.price },
            });
            return this.recomputeAndSave(tx, cartId, method.price, new client_1.Prisma.Decimal(cart.discountTotal));
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.shipping_method_assigned',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { shippingMethodId: dto.shippingMethodId, shippingTotal: Number(method.price) },
        });
        return this.formatCart(updatedCart);
    }
    async applyCoupon(cartId, dto, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const subtotal = new client_1.Prisma.Decimal(cart.subtotal);
        const { coupon, discount } = await this.couponsService.validateForCart(dto.code, subtotal, dto.customerId ?? cart.customerId ?? undefined);
        const updatedCart = await this.prisma.$transaction(async (tx) => {
            await tx.cart.update({
                where: { id: cartId },
                data: { couponId: coupon.id },
            });
            return this.recomputeAndSave(tx, cartId, new client_1.Prisma.Decimal(cart.shippingTotal), discount);
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'coupon.applied',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { couponCode: coupon.code, discount: Number(discount) },
        });
        return this.formatCart(updatedCart);
    }
    async removeCoupon(cartId, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const updatedCart = await this.prisma.$transaction(async (tx) => {
            await tx.cart.update({ where: { id: cartId }, data: { couponId: null } });
            return this.recomputeAndSave(tx, cartId, new client_1.Prisma.Decimal(cart.shippingTotal), new client_1.Prisma.Decimal(0));
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'coupon.removed',
            entityType: 'Cart',
            entityId: cartId,
            metadata: {},
        });
        return this.formatCart(updatedCart);
    }
    async assignPaymentMethod(cartId, dto, actorUserId) {
        const cart = await this.findById(cartId);
        this.assertCartEditable(cart);
        const updated = await this.prisma.cart.update({
            where: { id: cartId },
            data: { paymentMethod: dto.paymentMethod },
            include: CART_INCLUDE,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.payment_method_assigned',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { paymentMethod: dto.paymentMethod },
        });
        return this.formatCart(updated);
    }
    async checkout(cartId, dto, actorUserId) {
        const cart = await this.findById(cartId);
        if (cart.status !== client_1.CartStatus.ACTIVE) {
            throw new common_1.BadRequestException(`Cart cannot be checked out in status: ${cart.status}`);
        }
        if (!cart.items || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cannot checkout an empty cart');
        }
        if (cart.shippingMethodId) {
            const method = await this.prisma.shippingMethod.findUnique({
                where: { id: cart.shippingMethodId },
            });
            if (!method || !method.isActive) {
                throw new common_1.BadRequestException('Selected shipping method is no longer active');
            }
        }
        let customerId = dto.customerId ?? cart.customerId ?? null;
        if (!customerId && dto.guest) {
            const existing = await this.prisma.customer.findUnique({
                where: { email: dto.guest.email },
            });
            if (existing) {
                customerId = existing.id;
            }
            else {
                const newCustomer = await this.prisma.customer.create({
                    data: {
                        email: dto.guest.email,
                        firstName: dto.guest.firstName,
                        lastName: dto.guest.lastName,
                        phone: dto.guest.phone,
                        isActive: true,
                    },
                });
                customerId = newCustomer.id;
            }
        }
        if (!customerId) {
            throw new common_1.BadRequestException('Customer is required for checkout. Provide customerId or guest info.');
        }
        const itemSnapshots = [];
        for (const item of cart.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product || !product.isActive || product.status !== client_1.ProductStatus.ACTIVE) {
                throw new common_1.BadRequestException(`Product is no longer available: ${item.product?.name ?? item.productId}`);
            }
            if (product.trackQuantity && product.stockQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for: ${product.name}. Available: ${product.stockQuantity}`);
            }
            const unitPrice = new client_1.Prisma.Decimal(product.price);
            itemSnapshots.push({
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                unitPrice,
                totalPrice: unitPrice.mul(item.quantity),
                quantity: item.quantity,
                trackQuantity: product.trackQuantity,
            });
        }
        const totals = (0, orders_utils_1.calculateOrderTotals)({
            lineTotals: itemSnapshots.map((s) => s.totalPrice),
            shippingTotal: cart.shippingTotal,
            discountTotal: cart.discountTotal,
        });
        const MAX_RETRIES = 3;
        let order;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                order = await this.prisma.$transaction(async (tx) => {
                    const now = new Date();
                    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                    const todayCount = await tx.order.count({
                        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
                    });
                    const orderNumber = (0, orders_utils_1.generateOrderNumber)(now, todayCount + 1 + attempt);
                    const createdOrder = await tx.order.create({
                        data: {
                            orderNumber,
                            customerId,
                            shippingAddressId: dto.shippingAddressId,
                            notes: dto.notes ?? cart.notes,
                            subtotal: totals.subtotal,
                            discountTotal: totals.discountTotal,
                            shippingTotal: totals.shippingTotal,
                            grandTotal: totals.grandTotal,
                            currency: cart.currency,
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
                        include: { items: true, customer: true },
                    });
                    for (const snap of itemSnapshots) {
                        if (snap.trackQuantity) {
                            const res = await tx.product.updateMany({
                                where: { id: snap.productId, stockQuantity: { gte: snap.quantity } },
                                data: { stockQuantity: { decrement: snap.quantity } },
                            });
                            if (res.count === 0) {
                                throw new common_1.BadRequestException(`Insufficient stock for: ${snap.productName}`);
                            }
                        }
                    }
                    await tx.cart.update({
                        where: { id: cartId },
                        data: { status: client_1.CartStatus.CHECKED_OUT },
                    });
                    return createdOrder;
                });
                break;
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException || err instanceof common_1.BadRequestException)
                    throw err;
                if (err?.code === 'P2002' || err?.code === 'P2034')
                    continue;
                throw err;
            }
        }
        if (!order) {
            throw new common_1.BadRequestException('Checkout failed after multiple attempts. Please try again.');
        }
        if (cart.couponId) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    await tx.couponUsage.create({
                        data: { couponId: cart.couponId, orderId: order.id },
                    });
                    await tx.coupon.update({
                        where: { id: cart.couponId },
                        data: { usedCount: { increment: 1 } },
                    });
                });
            }
            catch {
            }
        }
        let payment = null;
        if (cart.paymentMethod) {
            try {
                payment = await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        method: cart.paymentMethod,
                        provider: this.resolveProvider(cart.paymentMethod),
                        amount: totals.grandTotal,
                        currency: cart.currency,
                    },
                });
            }
            catch {
            }
        }
        await this.auditLogsService.log({
            actorUserId,
            action: 'cart.checked_out',
            entityType: 'Cart',
            entityId: cartId,
            metadata: { orderId: order.id, customerId, grandTotal: Number(totals.grandTotal) },
        });
        return {
            order: {
                ...order,
                subtotal: Number(order.subtotal),
                discountTotal: Number(order.discountTotal),
                shippingTotal: Number(order.shippingTotal),
                grandTotal: Number(order.grandTotal),
                items: order.items.map((i) => ({
                    ...i,
                    unitPrice: Number(i.unitPrice),
                    totalPrice: Number(i.totalPrice),
                })),
            },
            payment,
        };
    }
    resolveProvider(method) {
        const map = {
            CARD: client_1.PaymentProvider.STRIPE,
            CASH_ON_DELIVERY: client_1.PaymentProvider.COD,
            BANK_TRANSFER: client_1.PaymentProvider.BANK,
            MANUAL: client_1.PaymentProvider.MANUAL,
        };
        return map[method] ?? client_1.PaymentProvider.MANUAL;
    }
};
exports.CartsService = CartsService;
exports.CartsService = CartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService,
        coupons_service_1.CouponsService])
], CartsService);
//# sourceMappingURL=carts.service.js.map