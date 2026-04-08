import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AssignOrderDto } from './dto/assign-order.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { TimelineQueryDto } from './dto/timeline-query.dto';

const ACTION_LABELS: Record<string, string> = {
  'order.created': 'Order Created',
  'order.status.updated': 'Status Updated',
  'order.cancelled': 'Order Cancelled',
  'order.payment_status.updated': 'Payment Status Updated',
  'order.fulfillment_status.updated': 'Fulfillment Status Updated',
  'order.assigned': 'Order Assigned',
  'order.unassigned': 'Order Unassigned',
  'order.priority.updated': 'Priority Updated',
  'order.tag.assigned': 'Tag Assigned',
  'order.tag.removed': 'Tag Removed',
  'order.note.created': 'Note Added',
  'order.note.updated': 'Note Updated',
  'order.note.deleted': 'Note Deleted',
  'payment.created': 'Payment Created',
  'payment.marked_paid': 'Payment Marked as Paid',
  'payment.marked_failed': 'Payment Failed',
  'payment.refunded_full': 'Payment Fully Refunded',
  'payment.refunded_partial': 'Payment Partially Refunded',
  'shipment.created': 'Shipment Created',
  'shipment.status_updated': 'Shipment Status Updated',
  'shipment.tracking_updated': 'Tracking Updated',
  'shipment.shipped': 'Shipment Shipped',
  'shipment.delivered': 'Shipment Delivered',
  'shipment.returned': 'Shipment Returned',
  'shipment.cancelled': 'Shipment Cancelled',
  'return.created': 'Return Request Created',
  'return.approved': 'Return Approved',
  'return.rejected': 'Return Rejected',
  'return.received': 'Return Items Received',
  'return.refund_pending': 'Return Refund Pending',
  'return.refunded': 'Return Refunded',
  'return.completed': 'Return Completed',
  'return.cancelled': 'Return Cancelled',
  'return.stock_restocked': 'Stock Restocked',
};

function formatLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return action
    .split('.')
    .map((w) => w.replace(/_/g, ' '))
    .join(' — ');
}

@Injectable()
export class AdminOpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async assignOrder(orderId: string, dto: AssignOrderDto, actorUserId?: string) {
    const [order, user] = await Promise.all([
      this.prisma.order.findUnique({ where: { id: orderId } }),
      this.prisma.user.findUnique({ where: { id: dto.userId } }),
    ]);

    if (!order) throw new NotFoundException('Order not found');
    if (!user) throw new NotFoundException('User not found');
    if (!user.isActive) {
      throw new BadRequestException('Cannot assign to an inactive user');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { assignedToUserId: dto.userId, assignedAt: new Date() },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.assigned',
      entityType: 'Order',
      entityId: orderId,
      metadata: {
        assignedToUserId: dto.userId,
        assignedToName: `${user.firstName} ${user.lastName}`,
      },
    });

    return updated;
  }

  async unassignOrder(orderId: string, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.assignedToUserId) {
      throw new BadRequestException('Order is not assigned to anyone');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { assignedToUserId: null, assignedAt: null },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.unassigned',
      entityType: 'Order',
      entityId: orderId,
      metadata: { previousAssignee: order.assignedToUserId },
    });

    return updated;
  }

  async setPriority(orderId: string, dto: SetPriorityDto, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { priority: dto.priority },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'order.priority.updated',
      entityType: 'Order',
      entityId: orderId,
      metadata: { from: order.priority, to: dto.priority },
    });

    return updated;
  }

  async getTimeline(orderId: string, query: TimelineQueryDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const sort = query.sort ?? 'desc';

    const [payments, shipments, returns, notes] = await Promise.all([
      this.prisma.payment.findMany({ where: { orderId }, select: { id: true } }),
      this.prisma.shipment.findMany({ where: { orderId }, select: { id: true } }),
      this.prisma.returnRequest.findMany({ where: { orderId }, select: { id: true } }),
      this.prisma.orderNote.findMany({ where: { orderId }, select: { id: true } }),
    ]);

    const entityIds = [
      orderId,
      ...payments.map((p) => p.id),
      ...shipments.map((s) => s.id),
      ...returns.map((r) => r.id),
      ...notes.map((n) => n.id),
    ];

    const auditLogs = await this.prisma.auditLog.findMany({
      where: { entityId: { in: entityIds } },
      include: {
        actor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: sort },
    });

    return auditLogs.map((log) => ({
      type: log.action,
      label: formatLabel(log.action),
      timestamp: log.createdAt,
      entityType: log.entityType,
      entityId: log.entityId,
      actor: log.actor
        ? {
            id: log.actor.id,
            name: `${log.actor.firstName} ${log.actor.lastName}`,
            email: log.actor.email,
          }
        : null,
      metadata: log.metadata,
    }));
  }
}
