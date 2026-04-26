import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  ProductStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CallsService } from '../calls/calls.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateFulfillmentStatusDto } from './dto/update-fulfillment-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
import {
  calculateOrderTotals,
  generateOrderNumber,
} from './orders.utils';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    @Inject(forwardRef(() => CallsService))
    private readonly callsService: CallsService,
  ) {}

  private formatOrder(order: any) {
    return {
      ...order,
      subtotal: order.subtotal != null ? Number(order.subtotal) : order.subtotal,
      discountTotal: order.discountTotal != null ? Number(order.discountTotal) : order.discountTotal,
      shippingTotal: order.shippingTotal != null ? Number(order.shippingTotal) : order.shippingTotal,
      grandTotal: order.grandTotal != null ? Number(order.grandTotal) : order.grandTotal,
      items: order.items
        ? order.items.map((item: any) => ({
            ...item,
            unitPrice: item.unitPrice != null ? Number(item.unitPrice) : item.unitPrice,
            totalPrice: item.totalPrice != null ? Number(item.totalPrice) : item.totalPrice,
          }))
        : undefined,
    };
  }

  private assertOrderStatusTransition(from: OrderStatus, to: OrderStatus) {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!allowed[from]?.includes(to)) {
      throw new BadRequestException(`Invalid order status transition: ${from} -> ${to}`);
    }
  }

  async create(dto: CreateOrderDto, actorUserId?: string) {
    // All validation, stock checks, order number generation and writes happen
    // inside a single serializable transaction to prevent race conditions.
    // If two concurrent requests generate the same orderNumber, the unique
    // constraint will fire and we retry up to 3 times with the next counter.

    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const order = await this.prisma.$transaction(async (tx) => {
          // 1. Validate customer (inside tx so the read is part of the same snapshot)
          const customer = await tx.customer.findUnique({
            where: { id: dto.customerId },
          });
          if (!customer) throw new NotFoundException('Customer not found');

          // 2. Validate shippingAddressId if provided
          if (dto.shippingAddressId) {
            const address = await tx.customerAddress.findFirst({
              where: { id: dto.shippingAddressId, customerId: dto.customerId },
            });
            if (!address) {
              throw new NotFoundException(
                'Shipping address not found or does not belong to customer',
              );
            }
          }

          // 3. Validate products and check stock atomically inside the transaction
          const itemSnapshots: Array<{
            productId: string;
            productName: string;
            sku: string;
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
            quantity: number;
            trackQuantity: boolean;
          }> = [];

          for (const item of dto.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            if (!product) throw new NotFoundException(`Product not found: ${item.productId}`);
            if (!product.isActive) {
              throw new BadRequestException(
                `Product is not available for ordering: ${product.name}`,
              );
            }
            if (product.status !== ProductStatus.ACTIVE) {
              throw new BadRequestException(
                `Product is not available for ordering: ${product.name}`,
              );
            }

            const unitPrice = product.price;
            const totalPrice = new Prisma.Decimal(unitPrice).mul(item.quantity);

            itemSnapshots.push({
              productId: product.id,
              productName: product.name,
              productImage: product.featuredImage || undefined,
              sku: product.sku,
              unitPrice,
              totalPrice,
              quantity: item.quantity,
              trackQuantity: product.trackQuantity,
            });
          }

          // 4. Generate order number inside transaction to get an accurate count
          const now = new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          const endOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999,
          );

          const todayOrderCount = await tx.order.count({
            where: { createdAt: { gte: startOfDay, lte: endOfDay } },
          });
          // Add `attempt` offset so retries on collision use the next counter value
          const orderNumber = generateOrderNumber(now, todayOrderCount + 1 + attempt);

          // 5. Calculate totals
          const totals = calculateOrderTotals({
            lineTotals: itemSnapshots.map((s) => s.totalPrice),
            shippingTotal: dto.shippingTotal,
            discountTotal: dto.discountTotal,
          });

          // 6. Create order + items
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
                  productImage: snap.productImage,
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

          // 7. Deduct stock for tracked products
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
                throw new BadRequestException(
                  `Insufficient stock for: ${snap.productName}`,
                );
              }
            }
          }

          return createdOrder;
        });

        // 8. Audit log (outside transaction — failure here must not roll back the order)
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

        // 9. Schedule AI call (fire-and-forget)
        try {
          await this.callsService.scheduleCall(order.id, 30);
        } catch (callError) {
          this.logger.error('Error scheduling call:', callError);
        }

        return this.formatOrder(order);
      } catch (err: any) {
        // Re-throw domain errors immediately — no retry needed
        if (
          err instanceof NotFoundException ||
          err instanceof BadRequestException
        ) {
          throw err;
        }

        // Prisma unique constraint (P2002) or serialization failure (P2034) → retry
        if (err?.code === 'P2002' || err?.code === 'P2034') {
          continue;
        }

        throw err;
      }
    }

    // All retries exhausted
    throw new InternalServerErrorException(
      'Failed to generate a unique order number after multiple attempts. Please try again.',
    );
  }

  async findAll(query: OrdersQueryDto) {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      paymentStatus,
      fulfillmentStatus,
      customerId,
      dateFrom,
      dateTo,
      assignedToUserId,
      priority,
      tagId,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fulfillmentStatus) where.fulfillmentStatus = fulfillmentStatus;
    if (customerId) where.customerId = customerId;
    if (assignedToUserId) where.assignedToUserId = assignedToUserId;
    if (priority) where.priority = priority;
    if (tagId) where.tagAssignments = { some: { tagId } };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
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

  async findOne(id: string) {
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
    if (!order) throw new NotFoundException('Order not found');
    return this.formatOrder(order);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, actorUserId?: string) {
    const order = await this.findOne(id);

    if (order.status === dto.status) {
      throw new BadRequestException(`Order is already in status: ${dto.status}`);
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

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto, actorUserId?: string) {
    const order = await this.findOne(id);

    if (
      dto.paymentStatus === PaymentStatus.REFUNDED &&
      order.status !== OrderStatus.DELIVERED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Payment status can only be set to REFUNDED when the order is DELIVERED or CANCELLED',
      );
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

  async updateFulfillmentStatus(
    id: string,
    dto: UpdateFulfillmentStatusDto,
    actorUserId?: string,
  ) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update fulfillment status of a cancelled order');
    }

    if (
      dto.fulfillmentStatus === FulfillmentStatus.RETURNED &&
      order.fulfillmentStatus !== FulfillmentStatus.FULFILLED
    ) {
      throw new BadRequestException(
        'Fulfillment status can only be set to RETURNED when the order is FULFILLED',
      );
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

  async cancelOrder(id: string, dto: CancelOrderDto, actorUserId?: string) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel an order that has been shipped or delivered');
    }
    if (order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException('Cannot cancel a refunded order');
    }

    // Restore stock for tracked products in a transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
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

      // Restore stock for items with tracked products
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

  async deleteOrder(id: string, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true },
    });

    if (!order) throw new NotFoundException(`Order ${id} not found`);

    await this.prisma.order.delete({ where: { id } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.deleted',
      entityType: 'Order',
      entityId: id,
      metadata: { orderNumber: order.orderNumber },
    });
  }
}
