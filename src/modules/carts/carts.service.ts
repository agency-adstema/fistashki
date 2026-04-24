import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, CartStatus, ProductStatus, PaymentProvider } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AssignCustomerDto } from './dto/assign-customer.dto';
import { AssignShippingMethodDto } from './dto/assign-shipping-method.dto';
import { AssignPaymentMethodDto } from './dto/assign-payment-method.dto';
import { ApplyCouponDto } from '../coupons/dto/apply-coupon.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CartsQueryDto } from './dto/carts-query.dto';
import { recalculateCartTotals } from './carts.utils';
import {
  generateOrderNumber,
  calculateOrderTotals,
} from '../orders/orders.utils';

const CART_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          slug: true,
          status: true,
          isActive: true,
          featuredImage: true,
          images: {
            select: { url: true, altText: true, sortOrder: true, isPrimary: true },
            orderBy: { sortOrder: 'asc' as const },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  customer: { select: { id: true, email: true, firstName: true, lastName: true } },
  shippingMethod: { select: { id: true, key: true, name: true, price: true } },
  coupon: { select: { id: true, code: true, type: true, value: true } },
} as const;

@Injectable()
export class CartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly couponsService: CouponsService,
  ) {}

  /** Iste pravila kao u ProductsService — shop/korpa moraju dobiti apsolutan URL za /uploads. */
  private resolvePublicAssetUrl(url: string | null | undefined): string | null | undefined {
    if (url == null || url === '') return url;
    if (url.startsWith('data:')) return url;
    const base = (process.env.PUBLIC_ASSET_BASE_URL || '').replace(/\/$/, '');
    if (!base) return url;
    if (url.startsWith('/uploads/')) {
      return `${base}${url}`;
    }
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      try {
        const u = new URL(url);
        return `${base}${u.pathname}${u.search}${u.hash}`;
      } catch {
        return url;
      }
    }
    return url;
  }

  private formatProductForCart(product: any) {
    if (!product) return product;
    const featured =
      this.resolvePublicAssetUrl(product.featuredImage) ?? product.featuredImage ?? null;
    let images = (product.images ?? []).map((img: any) => ({
      ...img,
      url: this.resolvePublicAssetUrl(img.url) ?? img.url,
    }));
    // Shop često koristi images[0].url; u bazi može biti samo featuredImage sa praznim images[].
    if (images.length === 0 && featured) {
      images = [
        {
          url: featured,
          altText: product.name ?? null,
          sortOrder: 0,
          isPrimary: true,
        },
      ];
    }
    const primary = images.find((i: any) => i.isPrimary) ?? images[0];
    const thumbnailUrl = featured || primary?.url || null;
    return {
      ...product,
      featuredImage: featured,
      images,
      thumbnailUrl,
      image: thumbnailUrl,
      thumbnail: thumbnailUrl,
      primaryImage: thumbnailUrl,
      imageUrl: thumbnailUrl,
    };
  }

  private formatCart(cart: any) {
    return {
      ...cart,
      subtotal: Number(cart.subtotal),
      discountTotal: Number(cart.discountTotal),
      shippingTotal: Number(cart.shippingTotal),
      grandTotal: Number(cart.grandTotal),
      items: cart.items?.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        product: this.formatProductForCart(item.product),
      })),
    };
  }

  private assertCartEditable(cart: { status: CartStatus }) {
    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException(
        `Cart cannot be modified in status: ${cart.status}`,
      );
    }
  }

  // ── Private helper: recompute + persist cart totals ──────────────────────
  private async recomputeAndSave(
    tx: any,
    cartId: string,
    shippingTotal: Prisma.Decimal,
    discountTotal: Prisma.Decimal,
  ) {
    const items = await tx.cartItem.findMany({ where: { cartId } });
    const totals = recalculateCartTotals(items, shippingTotal, discountTotal);

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

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async create(dto: CreateCartDto, actorUserId?: string) {
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
      if (!customer) throw new NotFoundException('Customer not found');
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

  async findAll(query: CartsQueryDto) {
    const { page = 1, limit = 50, status, customerId, sessionId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CartWhereInput = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (sessionId) where.sessionId = sessionId;

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

  async findById(id: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id }, include: CART_INCLUDE });
    if (!cart) throw new NotFoundException('Cart not found');
    return this.formatCart(cart);
  }

  async findBySessionId(sessionId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { sessionId, status: CartStatus.ACTIVE },
      include: CART_INCLUDE,
    });
    if (!cart) throw new NotFoundException('Active cart not found for this session');
    return this.formatCart(cart);
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  async addItem(cartId: string, dto: AddCartItemDto, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isActive || product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available for purchase');
    }

    // Check existing item in cart
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId: dto.productId } },
    });

    const newQty = existing ? existing.quantity + dto.quantity : dto.quantity;
    if (product.trackQuantity && product.stockQuantity < newQty) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stockQuantity}`,
      );
    }

    const unitPrice = new Prisma.Decimal(product.price);
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
      return this.recomputeAndSave(
        tx,
        cartId,
        new Prisma.Decimal(cart.shippingTotal),
        new Prisma.Decimal(cart.discountTotal),
      );
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

  async updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId } });
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity === 0) {
      return this.removeItem(cartId, itemId, actorUserId);
    }

    const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
    if (product?.trackQuantity && product.stockQuantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stockQuantity}`,
      );
    }

    const unitPrice = new Prisma.Decimal(item.unitPrice);
    const totalPrice = unitPrice.mul(dto.quantity);

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity: dto.quantity, totalPrice },
      });
      return this.recomputeAndSave(
        tx,
        cartId,
        new Prisma.Decimal(cart.shippingTotal),
        new Prisma.Decimal(cart.discountTotal),
      );
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

  async removeItem(cartId: string, itemId: string, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId } });
    if (!item) throw new NotFoundException('Cart item not found');

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.delete({ where: { id: itemId } });
      return this.recomputeAndSave(
        tx,
        cartId,
        new Prisma.Decimal(cart.shippingTotal),
        new Prisma.Decimal(cart.discountTotal),
      );
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

  async clearItems(cartId: string, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    const updatedCart = await this.prisma.cart.update({
      where: { id: cartId },
      data: { subtotal: 0, grandTotal: new Prisma.Decimal(cart.shippingTotal).sub(new Prisma.Decimal(cart.discountTotal)).lessThan(0) ? new Prisma.Decimal(0) : new Prisma.Decimal(cart.shippingTotal).sub(new Prisma.Decimal(cart.discountTotal)) },
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

  // ── Assignments ───────────────────────────────────────────────────────────

  async assignCustomer(cartId: string, dto: AssignCustomerDto, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

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

  async assignShippingMethod(cartId: string, dto: AssignShippingMethodDto, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    const method = await this.prisma.shippingMethod.findUnique({
      where: { id: dto.shippingMethodId },
    });
    if (!method) throw new NotFoundException('Shipping method not found');
    if (!method.isActive) throw new BadRequestException('Shipping method is inactive');

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cart.update({
        where: { id: cartId },
        data: { shippingMethodId: dto.shippingMethodId, shippingTotal: method.price },
      });
      return this.recomputeAndSave(
        tx,
        cartId,
        method.price,
        new Prisma.Decimal(cart.discountTotal),
      );
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

  async applyCoupon(cartId: string, dto: ApplyCouponDto, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    const subtotal = new Prisma.Decimal(cart.subtotal);
    const { coupon, discount } = await this.couponsService.validateForCart(
      dto.code,
      subtotal,
      dto.customerId ?? cart.customerId ?? undefined,
    );

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cart.update({
        where: { id: cartId },
        data: { couponId: coupon.id },
      });
      return this.recomputeAndSave(
        tx,
        cartId,
        new Prisma.Decimal(cart.shippingTotal),
        discount,
      );
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

  async removeCoupon(cartId: string, actorUserId?: string) {
    const cart = await this.findById(cartId);
    this.assertCartEditable(cart);

    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cart.update({ where: { id: cartId }, data: { couponId: null } });
      return this.recomputeAndSave(
        tx,
        cartId,
        new Prisma.Decimal(cart.shippingTotal),
        new Prisma.Decimal(0),
      );
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

  async assignPaymentMethod(cartId: string, dto: AssignPaymentMethodDto, actorUserId?: string) {
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

  // ── Checkout ──────────────────────────────────────────────────────────────

  async checkout(cartId: string, dto: CheckoutDto, actorUserId?: string) {
    const cart = await this.findById(cartId);

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException(`Cart cannot be checked out in status: ${cart.status}`);
    }
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    // Validate shipping method
    if (cart.shippingMethodId) {
      const method = await this.prisma.shippingMethod.findUnique({
        where: { id: cart.shippingMethodId },
      });
      if (!method || !method.isActive) {
        throw new BadRequestException('Selected shipping method is no longer active');
      }
    }

    // Resolve customer
    let customerId = dto.customerId ?? cart.customerId ?? null;
    if (!customerId && dto.guest) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: dto.guest.email },
      });
      if (existing) {
        customerId = existing.id;
      } else {
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
      throw new BadRequestException(
        'Customer is required for checkout. Provide customerId or guest info.',
      );
    }

    // Re-validate all items and build order item snapshots
    const itemSnapshots: Array<{
      productId: string;
      productName: string;
      sku: string;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
      quantity: number;
      trackQuantity: boolean;
    }> = [];

    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.isActive || product.status !== ProductStatus.ACTIVE) {
        throw new BadRequestException(
          `Product is no longer available: ${item.product?.name ?? item.productId}`,
        );
      }
      if (product.trackQuantity && product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for: ${product.name}. Available: ${product.stockQuantity}`,
        );
      }

      const unitPrice = new Prisma.Decimal(product.price);
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

    // Calculate final order totals
    const totals = calculateOrderTotals({
      lineTotals: itemSnapshots.map((s) => s.totalPrice),
      shippingTotal: cart.shippingTotal,
      discountTotal: cart.discountTotal,
    });

    // Create order in a transaction
    const MAX_RETRIES = 3;
    let order: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        order = await this.prisma.$transaction(async (tx) => {
          const now = new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

          const todayCount = await tx.order.count({
            where: { createdAt: { gte: startOfDay, lte: endOfDay } },
          });
          const orderNumber = generateOrderNumber(now, todayCount + 1 + attempt);

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

          // Deduct stock for tracked products
          for (const snap of itemSnapshots) {
            if (snap.trackQuantity) {
              const res = await tx.product.updateMany({
                where: { id: snap.productId, stockQuantity: { gte: snap.quantity } },
                data: { stockQuantity: { decrement: snap.quantity } },
              });
              if (res.count === 0) {
                throw new BadRequestException(`Insufficient stock for: ${snap.productName}`);
              }
            }
          }

          // Mark cart CHECKED_OUT
          await tx.cart.update({
            where: { id: cartId },
            data: { status: CartStatus.CHECKED_OUT },
          });

          return createdOrder;
        });
        break;
      } catch (err: any) {
        if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
        if (err?.code === 'P2002' || err?.code === 'P2034') continue;
        throw err;
      }
    }

    if (!order) {
      throw new BadRequestException('Checkout failed after multiple attempts. Please try again.');
    }

    // Record coupon usage if a coupon was applied
    if (cart.couponId) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.couponUsage.create({
            data: { couponId: cart.couponId!, orderId: order.id },
          });
          await tx.coupon.update({
            where: { id: cart.couponId! },
            data: { usedCount: { increment: 1 } },
          });
        });
      } catch {
        // Non-fatal: order already created
      }
    }

    // Create payment record if paymentMethod is set on cart
    let payment: any = null;
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
      } catch {
        // Non-fatal: order already created
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
        items: order.items.map((i: any) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
        })),
      },
      payment,
    };
  }

  private resolveProvider(method: string): PaymentProvider {
    const map: Record<string, PaymentProvider> = {
      CARD: PaymentProvider.STRIPE,
      CASH_ON_DELIVERY: PaymentProvider.COD,
      BANK_TRANSFER: PaymentProvider.BANK,
      MANUAL: PaymentProvider.MANUAL,
    };
    return map[method] ?? PaymentProvider.MANUAL;
  }
}
