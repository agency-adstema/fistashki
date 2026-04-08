import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  PaymentRecordStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { MarkFailedDto } from './dto/mark-failed.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsQueryDto } from './dto/payments-query.dto';
import { calculateRefund } from './payments.utils';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private formatPayment(p: any) {
    return {
      ...p,
      amount: p.amount != null ? Number(p.amount) : p.amount,
      refundedAmount: p.refundedAmount != null ? Number(p.refundedAmount) : p.refundedAmount,
    };
  }

  async create(dto: CreatePaymentDto, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot create payment for a cancelled order');
    }

    const amount = dto.amount != null
      ? new Prisma.Decimal(dto.amount)
      : order.grandTotal;

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        method: dto.method,
        provider: dto.provider,
        providerTransactionId: dto.providerTransactionId,
        amount,
        currency: dto.currency ?? order.currency,
        metadata: dto.metadata as any,
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

  async findAll(query: PaymentsQueryDto) {
    const { page = 1, limit = 50, orderId, orderNumber, status, method, provider, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    if (orderId) where.orderId = orderId;
    if (orderNumber) where.order = { orderNumber: { contains: orderNumber, mode: 'insensitive' } };
    if (status) where.status = status;
    if (method) where.method = method;
    if (provider) where.provider = provider;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo);
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

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { id: true, orderNumber: true, status: true, paymentStatus: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.formatPayment(payment);
  }

  async markPaid(id: string, dto: MarkPaidDto, actorUserId?: string) {
    const payment = await this.findOne(id);

    if (
      payment.status !== PaymentRecordStatus.PENDING &&
      payment.status !== PaymentRecordStatus.AUTHORIZED
    ) {
      throw new BadRequestException(
        `Payment cannot be marked as paid from status: ${payment.status}`,
      );
    }

    if (payment.order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot mark payment as paid for a cancelled order');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentRecordStatus.PAID,
          paidAt: new Date(),
          ...(dto.providerTransactionId && { providerTransactionId: dto.providerTransactionId }),
          ...(dto.metadata && { metadata: dto.metadata as any }),
        },
        include: { order: { select: { id: true, orderNumber: true } } },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: PaymentStatus.PAID },
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

  async markFailed(id: string, dto: MarkFailedDto, actorUserId?: string) {
    const payment = await this.findOne(id);

    if (
      payment.status === PaymentRecordStatus.PAID ||
      payment.status === PaymentRecordStatus.REFUNDED ||
      payment.status === PaymentRecordStatus.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestException(
        `Payment cannot be marked as failed from status: ${payment.status}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentRecordStatus.FAILED,
          failedAt: new Date(),
          failureReason: dto.failureReason,
        },
        include: { order: { select: { id: true, orderNumber: true } } },
      });

      // Only downgrade order paymentStatus if no other PAID payment exists
      const paidCount = await tx.payment.count({
        where: { orderId: payment.orderId, status: PaymentRecordStatus.PAID, id: { not: id } },
      });
      if (paidCount === 0) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.FAILED },
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

  async refund(id: string, dto: RefundPaymentDto, actorUserId?: string) {
    const payment = await this.findOne(id);

    if (
      payment.status !== PaymentRecordStatus.PAID &&
      payment.status !== PaymentRecordStatus.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestException(
        `Payment cannot be refunded from status: ${payment.status}`,
      );
    }

    const paymentAmount = new Prisma.Decimal(payment.amount);
    const currentRefunded = new Prisma.Decimal(payment.refundedAmount);

    // Full refund if no amount specified
    const refundAmount = dto.amount != null
      ? new Prisma.Decimal(dto.amount)
      : paymentAmount.sub(currentRefunded);

    const { newRefundedAmount, newStatus, refundedAt } = calculateRefund(
      paymentAmount,
      currentRefunded,
      refundAmount,
    );

    const isFullRefund = newStatus === PaymentRecordStatus.REFUNDED;

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
          data: { paymentStatus: PaymentStatus.REFUNDED },
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
}
