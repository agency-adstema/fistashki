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
exports.orderInclude = exports.OrdersService = void 0;
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const orders_gateway_1 = require("./orders.gateway");
const order_display_util_1 = require("./order-display.util");
const inventory_service_1 = require("../inventory/inventory.service");
const ETA_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 60];
const FRIES_SIZE_PRICES = { mali: 250, veliki: 350 };
const FRIES_SIZE_LABELS = {
    mali: 'Mali (100 g)',
    veliki: 'Veliki (200 g)',
};
function burgerItemLabel(lineIndex, lineCount) {
    return lineCount > 1 ? `Burger ${lineIndex + 1}` : 'Burger';
}
function prefixedBurgerItem(label, part) {
    return `${label} · ${part}`;
}
function isPomfritProduct(slug) {
    return Boolean(slug?.startsWith('pomfrit-'));
}
function resolvePomfritPrice(sizeId, fallback = 250) {
    if (sizeId && FRIES_SIZE_PRICES[sizeId] != null)
        return FRIES_SIZE_PRICES[sizeId];
    return fallback;
}
let OrdersService = class OrdersService {
    constructor(prisma, gateway, inventory) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.inventory = inventory;
    }
    generateToken() {
        return (0, crypto_1.randomBytes)(24).toString('base64url');
    }
    async nextOrderNumber(restaurantId) {
        const last = await this.prisma.order.findFirst({
            where: { restaurantId },
            orderBy: { orderNumber: 'desc' },
            select: { orderNumber: true },
        });
        return (last?.orderNumber ?? 1000) + 1;
    }
    async nextDisplayRef(restaurantId, date = new Date()) {
        const monthStart = (0, date_fns_1.startOfMonth)(date);
        const monthEnd = (0, date_fns_1.endOfMonth)(date);
        const count = await this.prisma.order.count({
            where: {
                restaurantId,
                createdAt: { gte: monthStart, lte: monthEnd },
            },
        });
        return (0, order_display_util_1.formatOrderDisplayRef)(date, count + 1);
    }
    mapOrder(order) {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            token: order.publicToken,
            displayId: (0, order_display_util_1.orderDisplayId)(order.displayRef, order.orderNumber),
            status: order.status,
            paymentStatus: order.paymentStatus,
            deliveryMethod: order.deliveryMethod,
            paymentMethod: order.paymentMethod,
            customer: {
                firstName: order.customerFirstName,
                lastName: order.customerLastName,
                phone: order.customerPhone,
                address: order.customerAddress,
                city: order.customerCity,
                note: order.customerNote,
            },
            internalNote: order.internalNote,
            items: order.items,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            discount: order.discount,
            tax: order.tax,
            total: order.total,
            estimatedMinutes: order.estimatedMinutes,
            estimatedReadyAt: order.estimatedReadyAt,
            driverId: order.driverId,
            driver: order.driver
                ? {
                    id: order.driver.id,
                    firstName: order.driver.firstName,
                    lastName: order.driver.lastName,
                    phone: order.driver.phone,
                }
                : null,
            createdAt: order.createdAt,
            acceptedAt: order.acceptedAt,
            completedAt: order.completedAt,
            cancelledAt: order.cancelledAt,
            trackingExpiresAt: order.trackingExpiresAt,
            statusHistory: order.statusHistory,
        };
    }
    async createOrder(restaurantSlug, dto) {
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { slug: restaurantSlug },
            include: { settings: true },
        });
        if (!restaurant?.settings)
            throw new common_1.NotFoundException('Restaurant not found');
        if (!restaurant.settings.isOpen)
            throw new common_1.BadRequestException('Restaurant is closed');
        const settings = restaurant.settings;
        if (dto.deliveryMethod === client_1.DeliveryMethod.DELIVERY && !settings.deliveryEnabled) {
            throw new common_1.BadRequestException('Delivery not available');
        }
        if (dto.deliveryMethod === client_1.DeliveryMethod.PICKUP && !settings.pickupEnabled) {
            throw new common_1.BadRequestException('Pickup not available');
        }
        if (dto.paymentMethod === client_1.PaymentMethod.CASH && !settings.cashEnabled) {
            throw new common_1.BadRequestException('Cash payment not available');
        }
        if (dto.paymentMethod === client_1.PaymentMethod.CARD && !settings.cardEnabled) {
            throw new common_1.BadRequestException('Card payment not available');
        }
        let discount = 0;
        let couponId;
        if (dto.couponCode) {
            const coupon = await this.prisma.coupon.findFirst({
                where: {
                    restaurantId: restaurant.id,
                    code: dto.couponCode.toUpperCase(),
                    isActive: true,
                },
            });
            if (!coupon)
                throw new common_1.BadRequestException('Invalid coupon');
            if (coupon.validUntil && coupon.validUntil < new Date()) {
                throw new common_1.BadRequestException('Coupon expired');
            }
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                throw new common_1.BadRequestException('Coupon usage limit reached');
            }
            couponId = coupon.id;
        }
        const items = [];
        let subtotal = 0;
        if (dto.burgerConfigs?.length) {
            const lineCount = dto.burgerConfigs.length;
            for (let lineIndex = 0; lineIndex < dto.burgerConfigs.length; lineIndex++) {
                const config = dto.burgerConfigs[lineIndex];
                const label = burgerItemLabel(lineIndex, lineCount);
                const lineMeta = { burgerLine: lineIndex + 1, burgerLineCount: lineCount };
                if (config.breadId) {
                    const bread = await this.findBread(restaurant.id, config.breadId);
                    if (!bread)
                        throw new common_1.BadRequestException('Invalid bread');
                    subtotal += bread.price;
                    items.push({
                        name: prefixedBurgerItem(label, `Testo: ${bread.name}`),
                        kind: 'bread',
                        quantity: 1,
                        unitPrice: bread.price,
                        totalPrice: bread.price,
                        options: { ...lineMeta, breadId: bread.id, slug: bread.slug },
                    });
                }
                const burger = await this.findBurger(restaurant.id, config.burgerId);
                if (!burger)
                    throw new common_1.BadRequestException('Invalid burger');
                const pomfrit = isPomfritProduct(burger.slug);
                const unitPrice = pomfrit
                    ? resolvePomfritPrice(config.sizeId, burger.price)
                    : burger.price;
                const sizeLabel = pomfrit && config.sizeId ? FRIES_SIZE_LABELS[config.sizeId] : undefined;
                const displayName = sizeLabel ? `${burger.name} — ${sizeLabel}` : burger.name;
                subtotal += unitPrice;
                items.push({
                    product: { connect: { id: burger.id } },
                    name: prefixedBurgerItem(label, displayName),
                    kind: pomfrit ? 'side' : 'burger',
                    quantity: 1,
                    unitPrice,
                    totalPrice: unitPrice,
                    options: {
                        ...lineMeta,
                        productId: burger.id,
                        slug: burger.slug,
                        ...(pomfrit && config.sizeId ? { friesSize: config.sizeId } : {}),
                    },
                });
                for (const ingId of config.ingredientIds ?? []) {
                    const ing = await this.findIngredient(restaurant.id, ingId);
                    if (ing) {
                        subtotal += ing.price;
                        items.push({
                            name: prefixedBurgerItem(label, ing.name),
                            kind: 'ingredient',
                            quantity: 1,
                            unitPrice: ing.price,
                            totalPrice: ing.price,
                            options: { ...lineMeta, ingredientId: ing.id },
                        });
                    }
                }
                for (const extraId of config.extraIds ?? []) {
                    const extra = await this.findExtra(restaurant.id, extraId);
                    if (extra) {
                        if (pomfrit && extra.slug !== 'ljuti-sos')
                            continue;
                        subtotal += extra.price;
                        items.push({
                            name: prefixedBurgerItem(label, extra.name),
                            kind: 'extra',
                            quantity: 1,
                            unitPrice: extra.price,
                            totalPrice: extra.price,
                            options: { ...lineMeta, extraId: extra.id },
                        });
                    }
                }
            }
        }
        else {
            const burgerLines = [];
            if (dto.burgerItems?.length) {
                burgerLines.push(...dto.burgerItems);
            }
            else if (dto.burgerId) {
                burgerLines.push({ id: dto.burgerId, quantity: 1 });
            }
            if (burgerLines.length === 0) {
                throw new common_1.BadRequestException('At least one burger is required');
            }
            const totalBurgers = burgerLines.reduce((sum, line) => sum + line.quantity, 0);
            if (dto.breadId && totalBurgers > 0) {
                const bread = await this.findBread(restaurant.id, dto.breadId);
                if (!bread)
                    throw new common_1.BadRequestException('Invalid bread');
                const lineTotal = bread.price * totalBurgers;
                subtotal += lineTotal;
                items.push({
                    name: `Testo: ${bread.name}`,
                    kind: 'bread',
                    quantity: totalBurgers,
                    unitPrice: bread.price,
                    totalPrice: lineTotal,
                    options: { breadId: bread.id, slug: bread.slug },
                });
            }
            for (const line of burgerLines) {
                const burger = await this.findBurger(restaurant.id, line.id);
                if (!burger)
                    throw new common_1.BadRequestException('Invalid burger');
                const lineTotal = burger.price * line.quantity;
                subtotal += lineTotal;
                items.push({
                    product: { connect: { id: burger.id } },
                    name: burger.name,
                    kind: 'burger',
                    quantity: line.quantity,
                    unitPrice: burger.price,
                    totalPrice: lineTotal,
                    options: { productId: burger.id, slug: burger.slug },
                });
            }
            for (const ingId of dto.ingredientIds ?? []) {
                const ing = await this.findIngredient(restaurant.id, ingId);
                if (ing && totalBurgers > 0) {
                    const lineTotal = ing.price * totalBurgers;
                    subtotal += lineTotal;
                    items.push({
                        name: ing.name,
                        kind: 'ingredient',
                        quantity: totalBurgers,
                        unitPrice: ing.price,
                        totalPrice: lineTotal,
                        options: { ingredientId: ing.id },
                    });
                }
            }
            for (const extraId of dto.extraIds ?? []) {
                const extra = await this.findExtra(restaurant.id, extraId);
                if (extra && totalBurgers > 0) {
                    const lineTotal = extra.price * totalBurgers;
                    subtotal += lineTotal;
                    items.push({
                        name: extra.name,
                        kind: 'extra',
                        quantity: totalBurgers,
                        unitPrice: extra.price,
                        totalPrice: lineTotal,
                        options: { extraId: extra.id },
                    });
                }
            }
        }
        if (items.length === 0) {
            throw new common_1.BadRequestException('At least one burger is required');
        }
        const drinkLines = [];
        if (dto.drinkItems?.length) {
            drinkLines.push(...dto.drinkItems);
        }
        else if (dto.drinkId) {
            drinkLines.push({ id: dto.drinkId, quantity: 1 });
        }
        for (const line of drinkLines) {
            const drink = await this.findDrink(restaurant.id, line.id);
            if (drink) {
                const lineTotal = drink.price * line.quantity;
                subtotal += lineTotal;
                items.push({
                    name: drink.name,
                    kind: 'drink',
                    quantity: line.quantity,
                    unitPrice: drink.price,
                    totalPrice: lineTotal,
                    options: { drinkId: drink.id },
                });
            }
        }
        let deliveryFee = 0;
        if (dto.deliveryMethod === client_1.DeliveryMethod.DELIVERY) {
            deliveryFee = settings.deliveryFee;
            if (couponId) {
                const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
                if (coupon?.freeDelivery)
                    deliveryFee = 0;
                else if (settings.freeDeliveryMin > 0 && subtotal >= settings.freeDeliveryMin)
                    deliveryFee = 0;
            }
            else if (settings.freeDeliveryMin > 0 && subtotal >= settings.freeDeliveryMin) {
                deliveryFee = 0;
            }
        }
        if (couponId) {
            const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
            if (coupon && subtotal < coupon.minOrderAmount) {
                throw new common_1.BadRequestException('Minimum order amount not met for coupon');
            }
            if (coupon?.percentOff)
                discount = Math.round(subtotal * (coupon.percentOff / 100));
            else if (coupon?.fixedOff)
                discount = coupon.fixedOff;
        }
        const gross = subtotal - discount + deliveryFee;
        const tax = settings.taxRate > 0
            ? Math.round((gross * settings.taxRate) / (1 + settings.taxRate))
            : 0;
        const total = gross;
        if (settings.minOrderAmount > 0 && subtotal < settings.minOrderAmount) {
            throw new common_1.BadRequestException('Minimum order amount not met');
        }
        const customer = await this.prisma.customer.upsert({
            where: {
                restaurantId_phone: {
                    restaurantId: restaurant.id,
                    phone: dto.customer.phone,
                },
            },
            update: {
                firstName: dto.customer.firstName,
                lastName: dto.customer.lastName,
            },
            create: {
                restaurantId: restaurant.id,
                firstName: dto.customer.firstName,
                lastName: dto.customer.lastName,
                phone: dto.customer.phone,
            },
        });
        if (dto.customer.address) {
            await this.prisma.customerAddress.create({
                data: {
                    customerId: customer.id,
                    address: dto.customer.address,
                    city: dto.customer.city,
                },
            });
        }
        const orderNumber = await this.nextOrderNumber(restaurant.id);
        const displayRef = await this.nextDisplayRef(restaurant.id);
        const publicToken = this.generateToken();
        const order = await this.prisma.order.create({
            data: {
                restaurantId: restaurant.id,
                customerId: customer.id,
                couponId,
                orderNumber,
                displayRef,
                publicToken,
                customerFirstName: dto.customer.firstName,
                customerLastName: dto.customer.lastName,
                customerPhone: dto.customer.phone,
                customerAddress: dto.customer.address,
                customerCity: dto.customer.city,
                customerNote: dto.customer.note,
                deliveryMethod: dto.deliveryMethod,
                paymentMethod: dto.paymentMethod,
                paymentStatus: dto.paymentMethod === client_1.PaymentMethod.CASH ? client_1.PaymentStatus.PENDING : client_1.PaymentStatus.PENDING,
                status: client_1.OrderStatus.NEW,
                subtotal,
                deliveryFee,
                discount,
                tax,
                total,
                items: { create: items },
                statusHistory: { create: { status: client_1.OrderStatus.NEW, note: 'Order placed' } },
            },
            include: orderInclude,
        });
        if (couponId) {
            await this.prisma.coupon.update({
                where: { id: couponId },
                data: { usedCount: { increment: 1 } },
            });
        }
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: { orderCount: { increment: 1 }, totalSpent: { increment: total } },
        });
        await this.prisma.notification.create({
            data: {
                restaurantId: restaurant.id,
                type: client_1.NotificationType.NEW_ORDER,
                title: 'Nova porudžbina',
                message: `Porudžbina ${displayRef} — ${formatPrice(total)}`,
                orderId: order.id,
            },
        });
        await this.inventory.deductForOrder(restaurant.id, order.id, order.items.map((i) => ({ kind: i.kind, options: i.options, quantity: i.quantity })));
        const mapped = this.mapOrder(order);
        this.gateway.emitNewOrder(restaurant.id, mapped);
        return {
            ...mapped,
            trackingUrl: `/order/${publicToken}`,
        };
    }
    async findAll(restaurantId, status) {
        const orders = await this.prisma.order.findMany({
            where: {
                restaurantId,
                ...(status ? { status } : {}),
            },
            include: orderInclude,
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        return orders.map((o) => this.mapOrder(o));
    }
    async findNew(restaurantId) {
        return this.findAll(restaurantId, client_1.OrderStatus.NEW);
    }
    async findOne(restaurantId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, restaurantId },
            include: orderInclude,
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.mapOrder(order);
    }
    async trackByToken(tokenOrRef) {
        const lookup = decodeURIComponent(tokenOrRef).trim();
        let order = await this.prisma.order.findUnique({
            where: { publicToken: lookup },
            include: orderInclude,
        });
        if (!order && /^\d{2}-\d{3}$/.test(lookup)) {
            order = await this.prisma.order.findFirst({
                where: { displayRef: lookup },
                orderBy: { createdAt: 'desc' },
                include: orderInclude,
            });
        }
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const terminalStatuses = [
            client_1.OrderStatus.COMPLETED,
            client_1.OrderStatus.CANCELLED,
            client_1.OrderStatus.REJECTED,
        ];
        const isCompleted = terminalStatuses.includes(order.status);
        const expired = isCompleted &&
            order.trackingExpiresAt &&
            order.trackingExpiresAt < new Date();
        if (expired) {
            return {
                expired: true,
                message: 'Porudžbina je završena. Detalji više nisu dostupni.',
                status: order.status,
                orderNumber: order.orderNumber,
            };
        }
        return { expired: false, ...this.mapOrder(order) };
    }
    async accept(restaurantId, id, dto, userId) {
        if (!ETA_OPTIONS.includes(dto.estimatedMinutes)) {
            throw new common_1.BadRequestException('Invalid preparation time');
        }
        const order = await this.prisma.order.findFirst({ where: { id, restaurantId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== client_1.OrderStatus.NEW) {
            throw new common_1.BadRequestException('Order cannot be accepted');
        }
        const estimatedReadyAt = (0, date_fns_1.addMinutes)(new Date(), dto.estimatedMinutes);
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status: client_1.OrderStatus.ACCEPTED,
                estimatedMinutes: dto.estimatedMinutes,
                estimatedReadyAt,
                acceptedAt: new Date(),
                internalNote: dto.internalNote ?? order.internalNote,
                statusHistory: {
                    create: {
                        status: client_1.OrderStatus.ACCEPTED,
                        note: `Accepted — ${dto.estimatedMinutes} min`,
                        createdBy: userId,
                    },
                },
            },
            include: orderInclude,
        });
        const mapped = this.mapOrder(updated);
        this.gateway.emitOrderUpdate(restaurantId, mapped);
        this.gateway.emitOrderUpdatePublic(order.publicToken, mapped);
        return mapped;
    }
    async reject(restaurantId, id, dto, userId) {
        const order = await this.prisma.order.findFirst({ where: { id, restaurantId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const rejectable = [client_1.OrderStatus.NEW, client_1.OrderStatus.ACCEPTED];
        if (!rejectable.includes(order.status)) {
            throw new common_1.BadRequestException('Order cannot be rejected');
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status: client_1.OrderStatus.REJECTED,
                cancelledAt: new Date(),
                internalNote: dto.reason ?? order.internalNote,
                statusHistory: {
                    create: { status: client_1.OrderStatus.REJECTED, note: dto.reason, createdBy: userId },
                },
            },
            include: orderInclude,
        });
        const mapped = this.mapOrder(updated);
        this.gateway.emitOrderUpdate(restaurantId, mapped);
        this.gateway.emitOrderUpdatePublic(order.publicToken, mapped);
        return mapped;
    }
    async updateStatus(restaurantId, id, dto, userId) {
        const order = await this.prisma.order.findFirst({ where: { id, restaurantId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const data = {
            status: dto.status,
            statusHistory: {
                create: { status: dto.status, note: dto.note, createdBy: userId },
            },
        };
        if (dto.internalNote !== undefined)
            data.internalNote = dto.internalNote;
        if (dto.driverId !== undefined)
            data.driver = dto.driverId ? { connect: { id: dto.driverId } } : { disconnect: true };
        if (dto.status === client_1.OrderStatus.IN_PREPARATION) {
        }
        if (dto.status === client_1.OrderStatus.COMPLETED) {
            data.completedAt = new Date();
            data.trackingExpiresAt = (0, date_fns_1.addHours)(new Date(), 24);
            if (order.paymentMethod === client_1.PaymentMethod.CASH) {
                data.paymentStatus = client_1.PaymentStatus.PAID;
            }
        }
        const cancelledStatuses = [client_1.OrderStatus.CANCELLED, client_1.OrderStatus.REJECTED];
        if (cancelledStatuses.includes(dto.status)) {
            data.cancelledAt = new Date();
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data,
            include: orderInclude,
        });
        const mapped = this.mapOrder(updated);
        this.gateway.emitOrderUpdate(restaurantId, mapped);
        this.gateway.emitOrderUpdatePublic(order.publicToken, mapped);
        return mapped;
    }
    async kitchenOrders(restaurantId) {
        const orders = await this.prisma.order.findMany({
            where: {
                restaurantId,
                status: { in: [client_1.OrderStatus.ACCEPTED, client_1.OrderStatus.IN_PREPARATION] },
            },
            include: {
                items: true,
                statusHistory: { orderBy: { createdAt: 'asc' } },
            },
            orderBy: { estimatedReadyAt: 'asc' },
        });
        return orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            displayId: (0, order_display_util_1.orderDisplayId)(o.displayRef, o.orderNumber),
            status: o.status,
            estimatedMinutes: o.estimatedMinutes,
            estimatedReadyAt: o.estimatedReadyAt,
            customerNote: o.customerNote,
            deliveryMethod: o.deliveryMethod,
            items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, note: i.note, kind: i.kind, options: i.options })),
            createdAt: o.createdAt,
        }));
    }
    async deliveryOrders(restaurantId) {
        const orders = await this.prisma.order.findMany({
            where: {
                restaurantId,
                deliveryMethod: client_1.DeliveryMethod.DELIVERY,
                status: { in: [client_1.OrderStatus.READY, client_1.OrderStatus.OUT_FOR_DELIVERY] },
            },
            include: { items: true },
            orderBy: { estimatedReadyAt: 'asc' },
        });
        return orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            displayId: (0, order_display_util_1.orderDisplayId)(o.displayRef, o.orderNumber),
            status: o.status,
            customerFirstName: o.customerFirstName,
            customerLastName: o.customerLastName,
            customerPhone: o.customerPhone,
            customerAddress: o.customerAddress,
            customerCity: o.customerCity,
            customerNote: o.customerNote,
            total: o.total,
            items: o.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                totalPrice: i.totalPrice,
                kind: i.kind,
                options: i.options,
            })),
            createdAt: o.createdAt,
        }));
    }
    findBread(restaurantId, idOrSlug) {
        return this.prisma.breadType.findFirst({
            where: {
                restaurantId,
                isAvailable: true,
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });
    }
    findBurger(restaurantId, idOrSlug) {
        return this.prisma.product.findFirst({
            where: {
                restaurantId,
                isAvailable: true,
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });
    }
    findIngredient(restaurantId, idOrSlug) {
        return this.prisma.ingredient.findFirst({
            where: {
                restaurantId,
                isAvailable: true,
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });
    }
    findExtra(restaurantId, idOrSlug) {
        return this.prisma.extra.findFirst({
            where: {
                restaurantId,
                isAvailable: true,
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });
    }
    findDrink(restaurantId, idOrSlug) {
        return this.prisma.drink.findFirst({
            where: {
                restaurantId,
                isAvailable: true,
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
        });
    }
    async todayStats(restaurantId) {
        const from = (0, date_fns_1.startOfDay)(new Date());
        const to = (0, date_fns_1.endOfDay)(new Date());
        return this.statsForRange(restaurantId, from, to);
    }
    async statsForRange(restaurantId, from, to) {
        const orders = await this.prisma.order.findMany({
            where: {
                restaurantId,
                createdAt: { gte: from, lte: to },
            },
            select: {
                status: true,
                total: true,
                deliveryMethod: true,
                items: { select: { name: true, quantity: true, totalPrice: true } },
            },
        });
        const completedOrders = await this.prisma.order.findMany({
            where: {
                restaurantId,
                status: client_1.OrderStatus.COMPLETED,
                OR: [
                    { completedAt: { gte: from, lte: to } },
                    { completedAt: null, createdAt: { gte: from, lte: to } },
                ],
            },
            select: {
                total: true,
                deliveryMethod: true,
                items: { select: { name: true, quantity: true, totalPrice: true, kind: true } },
            },
        });
        const totalOrders = orders.length;
        const inactiveStatuses = [
            client_1.OrderStatus.COMPLETED,
            client_1.OrderStatus.CANCELLED,
            client_1.OrderStatus.REJECTED,
        ];
        const active = orders.filter((o) => !inactiveStatuses.includes(o.status)).length;
        const completed = completedOrders.length;
        const cancelled = orders.filter((o) => o.status === client_1.OrderStatus.CANCELLED || o.status === client_1.OrderStatus.REJECTED).length;
        const revenue = completedOrders.reduce((s, o) => s + o.total, 0);
        const deliveries = orders.filter((o) => o.deliveryMethod === client_1.DeliveryMethod.DELIVERY).length;
        const pickups = orders.filter((o) => o.deliveryMethod === client_1.DeliveryMethod.PICKUP).length;
        const avgOrderValue = completed ? Math.round(revenue / completed) : 0;
        const productMap = new Map();
        const mainProductKinds = new Set(['burger', 'drink']);
        for (const o of completedOrders) {
            for (const item of o.items) {
                if (!item.kind || !mainProductKinds.has(item.kind))
                    continue;
                const prev = productMap.get(item.name) ?? { count: 0, revenue: 0 };
                productMap.set(item.name, {
                    count: prev.count + item.quantity,
                    revenue: prev.revenue + item.totalPrice,
                });
            }
        }
        const topProducts = [...productMap.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([name, stats]) => ({ name, count: stats.count, revenue: stats.revenue }));
        return {
            totalOrders,
            activeOrders: active,
            completedOrders: completed,
            cancelledOrders: cancelled,
            revenue,
            avgOrderValue,
            deliveries,
            pickups,
            topProducts,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_gateway_1.OrdersGateway,
        inventory_service_1.InventoryService])
], OrdersService);
const orderInclude = {
    items: true,
    statusHistory: { orderBy: { createdAt: 'asc' } },
    driver: { select: { id: true, firstName: true, lastName: true, phone: true } },
};
exports.orderInclude = orderInclude;
function formatPrice(amount) {
    return `${amount.toLocaleString('sr-RS')} RSD`;
}
//# sourceMappingURL=orders.service.js.map