import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, ReturnStatus, OrderStatus, PaymentRecordStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { RejectReturnDto } from './dto/reject-return.dto';
import { ReturnsQueryDto } from './dto/returns-query.dto';
import {
  assertReturnStatusTransition,
  calculateReturnTotal,
  validateReturnQuantities,
} from './returns.utils';

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
} as const;

const INVALID_ORDER_STATUSES_FOR_RETURN: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CANCELLED,
];

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  private formatReturn(r: any) {
    return {
      ...r,
      items: r.items?.map((item: any) => ({
        ...item,
        unitPriceSnapshot: item.unitPriceSnapshot != null ? Number(item.unitPriceSnapshot) : null,
        totalAmount: item.totalAmount != null ? Number(item.totalAmount) : null,
      })),
    };
  }

  async create(dto: CreateReturnDto, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (INVALID_ORDER_STATUSES_FOR_RETURN.includes(order.status)) {
      throw new BadRequestException(
        `Cannot create a return for an order with status: ${order.status}`,
      );
    }

    // Collect existing return items (active statuses only, excluding CANCELLED/REJECTED)
    const activeStatuses: ReturnStatus[] = [
      ReturnStatus.REQUESTED,
      ReturnStatus.APPROVED,
      ReturnStatus.RECEIVED,
      ReturnStatus.REFUND_PENDING,
      ReturnStatus.REFUNDED,
      ReturnStatus.COMPLETED,
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

    const errors = validateReturnQuantities(
      dto.items,
      order.items.map((oi) => ({ id: oi.id, quantity: oi.quantity })),
      existingReturnItems,
    );

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }

    const returnRequest = await this.prisma.returnRequest.create({
      data: {
        orderId: dto.orderId,
        customerId: dto.customerId ?? null,
        reason: dto.reason,
        notes: dto.notes ?? null,
        items: {
          create: dto.items.map((item) => {
            const orderItem = order.items.find((oi) => oi.id === item.orderItemId)!;
            const unitPrice = new Prisma.Decimal(orderItem.unitPrice.toString());
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

  async findAll(query: ReturnsQueryDto) {
    const {
      page = 1,
      limit = 50,
      orderId,
      orderNumber,
      status,
      customerId,
      dateFrom,
      dateTo,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReturnRequestWhereInput = {};
    if (orderId) where.orderId = orderId;
    if (orderNumber) {
      where.order = { orderNumber: { contains: orderNumber, mode: 'insensitive' } };
    }
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo);
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

  async findOne(id: string) {
    const r = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: RETURN_INCLUDE,
    });
    if (!r) throw new NotFoundException('Return request not found');
    return this.formatReturn(r);
  }

  async approve(id: string, actorUserId?: string) {
    const r = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Return request not found');

    assertReturnStatusTransition(r.status, ReturnStatus.APPROVED);

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: { status: ReturnStatus.APPROVED, approvedAt: new Date() },
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

  async reject(id: string, dto: RejectReturnDto, actorUserId?: string) {
    const r = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Return request not found');

    assertReturnStatusTransition(r.status, ReturnStatus.REJECTED);

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: {
        status: ReturnStatus.REJECTED,
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

  async markReceived(id: string, actorUserId?: string) {
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
    if (!r) throw new NotFoundException('Return request not found');

    assertReturnStatusTransition(r.status, ReturnStatus.RECEIVED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedReturn = await tx.returnRequest.update({
        where: { id },
        data: { status: ReturnStatus.RECEIVED, receivedAt: new Date() },
        include: RETURN_INCLUDE,
      });

      // Restock tracked products
      const restockedItems: Array<{ productId: string; qty: number }> = [];
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

  async markRefundPending(id: string, actorUserId?: string) {
    const r = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Return request not found');

    assertReturnStatusTransition(r.status, ReturnStatus.REFUND_PENDING);

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: { status: ReturnStatus.REFUND_PENDING },
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

  async refund(id: string, actorUserId?: string) {
    const r = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!r) throw new NotFoundException('Return request not found');

    // Allow refund from RECEIVED or REFUND_PENDING
    if (
      r.status !== ReturnStatus.RECEIVED &&
      r.status !== ReturnStatus.REFUND_PENDING
    ) {
      throw new BadRequestException(
        `Cannot refund from status: ${r.status}. Allowed: RECEIVED, REFUND_PENDING`,
      );
    }

    const returnTotal = calculateReturnTotal(r.items);

    if (returnTotal.lte(0)) {
      throw new BadRequestException('Return total must be greater than 0');
    }

    // Find eligible payment for the order
    const eligiblePayment = await this.prisma.payment.findFirst({
      where: {
        orderId: r.orderId,
        status: {
          in: [PaymentRecordStatus.PAID, PaymentRecordStatus.PARTIALLY_REFUNDED],
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!eligiblePayment) {
      throw new BadRequestException('No eligible paid payment found for this order');
    }

    const available = new Prisma.Decimal(eligiblePayment.amount.toString()).sub(
      new Prisma.Decimal(eligiblePayment.refundedAmount.toString()),
    );

    if (returnTotal.greaterThan(available)) {
      throw new BadRequestException(
        `Refund amount ${returnTotal} exceeds available refundable amount ${available}`,
      );
    }

    // Process refund via PaymentsService
    await this.paymentsService.refund(
      eligiblePayment.id,
      { amount: returnTotal.toNumber() },
      actorUserId,
    );

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: { status: ReturnStatus.REFUNDED },
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

  async complete(id: string, actorUserId?: string) {
    const r = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Return request not found');

    assertReturnStatusTransition(r.status, ReturnStatus.COMPLETED);

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: { status: ReturnStatus.COMPLETED, completedAt: new Date() },
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

  async cancel(id: string, actorUserId?: string) {
    const r = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Return request not found');

    assertReturnStatusTransition(r.status, ReturnStatus.CANCELLED);

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: { status: ReturnStatus.CANCELLED },
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
}
