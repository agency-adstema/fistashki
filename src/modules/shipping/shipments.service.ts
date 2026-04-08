import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, OrderStatus, ShipmentStatus, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { ShipmentsQueryDto } from './dto/shipments-query.dto';
import {
  assertShipmentStatusTransition,
  computeOrderFulfillmentStatus,
} from './shipping.utils';

const SHIPMENT_INCLUDE = {
  order: { select: { id: true, orderNumber: true, fulfillmentStatus: true } },
  shippingMethod: { select: { id: true, key: true, name: true } },
} as const;

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateShipmentDto, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot create a shipment for a cancelled order');
    }

    if (dto.shippingMethodId) {
      const method = await this.prisma.shippingMethod.findUnique({
        where: { id: dto.shippingMethodId },
      });
      if (!method) throw new NotFoundException('Shipping method not found');
    }

    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        shippingMethodId: dto.shippingMethodId,
        courier: dto.courier,
        service: dto.service,
        trackingNumber: dto.trackingNumber,
        trackingUrl: dto.trackingUrl,
        notes: dto.notes,
        metadata: dto.metadata as any,
      },
      include: SHIPMENT_INCLUDE,
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipment.created',
      entityType: 'Shipment',
      entityId: shipment.id,
      metadata: { orderId: dto.orderId },
    });

    return shipment;
  }

  async findAll(query: ShipmentsQueryDto) {
    const {
      page = 1,
      limit = 50,
      orderId,
      orderNumber,
      status,
      courier,
      trackingNumber,
      dateFrom,
      dateTo,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ShipmentWhereInput = {};
    if (orderId) where.orderId = orderId;
    if (orderNumber) where.order = { orderNumber: { contains: orderNumber, mode: 'insensitive' } };
    if (status) where.status = status;
    if (courier) where.courier = { contains: courier, mode: 'insensitive' };
    if (trackingNumber) where.trackingNumber = { contains: trackingNumber, mode: 'insensitive' };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: SHIPMENT_INCLUDE,
      }),
      this.prisma.shipment.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: SHIPMENT_INCLUDE,
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async updateStatus(id: string, dto: UpdateShipmentStatusDto, actorUserId?: string) {
    const shipment = await this.findOne(id);
    assertShipmentStatusTransition(shipment.status, dto.status);

    const data: Prisma.ShipmentUpdateInput = { status: dto.status };
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status === ShipmentStatus.SHIPPED) data.shippedAt = new Date();
    if (dto.status === ShipmentStatus.DELIVERED) data.deliveredAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedShipment = await tx.shipment.update({
        where: { id },
        data,
        include: SHIPMENT_INCLUDE,
      });

      await this.syncOrderFulfillment(tx, shipment.orderId);

      return updatedShipment;
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipment.status.updated',
      entityType: 'Shipment',
      entityId: id,
      metadata: { from: shipment.status, to: dto.status },
    });

    return updated;
  }

  async updateTracking(id: string, dto: UpdateTrackingDto, actorUserId?: string) {
    await this.findOne(id);

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: {
        ...(dto.courier !== undefined && { courier: dto.courier }),
        ...(dto.service !== undefined && { service: dto.service }),
        ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
        ...(dto.trackingUrl !== undefined && { trackingUrl: dto.trackingUrl }),
      },
      include: SHIPMENT_INCLUDE,
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipment.tracking.updated',
      entityType: 'Shipment',
      entityId: id,
      metadata: dto as any,
    });

    return updated;
  }

  async markShipped(id: string, actorUserId?: string) {
    const shipment = await this.findOne(id);
    assertShipmentStatusTransition(shipment.status, ShipmentStatus.SHIPPED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id },
        data: { status: ShipmentStatus.SHIPPED, shippedAt: new Date() },
        include: SHIPMENT_INCLUDE,
      });
      await this.syncOrderFulfillment(tx, shipment.orderId);
      return s;
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipment.shipped',
      entityType: 'Shipment',
      entityId: id,
      metadata: { orderId: shipment.orderId },
    });

    return updated;
  }

  async markDelivered(id: string, actorUserId?: string) {
    const shipment = await this.findOne(id);
    assertShipmentStatusTransition(shipment.status, ShipmentStatus.DELIVERED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id },
        data: { status: ShipmentStatus.DELIVERED, deliveredAt: new Date() },
        include: SHIPMENT_INCLUDE,
      });
      await this.syncOrderFulfillment(tx, shipment.orderId);
      return s;
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipment.delivered',
      entityType: 'Shipment',
      entityId: id,
      metadata: { orderId: shipment.orderId },
    });

    return updated;
  }

  async markReturned(id: string, actorUserId?: string) {
    const shipment = await this.findOne(id);
    assertShipmentStatusTransition(shipment.status, ShipmentStatus.RETURNED);

    const updated = await this.prisma.$transaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id },
        data: { status: ShipmentStatus.RETURNED },
        include: SHIPMENT_INCLUDE,
      });
      await this.syncOrderFulfillment(tx, shipment.orderId);
      return s;
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipment.returned',
      entityType: 'Shipment',
      entityId: id,
      metadata: { orderId: shipment.orderId },
    });

    return updated;
  }

  async cancel(id: string, actorUserId?: string) {
    const shipment = await this.findOne(id);
    assertShipmentStatusTransition(shipment.status, ShipmentStatus.CANCELLED);

    const updated = await this.prisma.shipment.update({
      where: { id },
      data: { status: ShipmentStatus.CANCELLED },
      include: SHIPMENT_INCLUDE,
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'shipment.cancelled',
      entityType: 'Shipment',
      entityId: id,
      metadata: { orderId: shipment.orderId },
    });

    return updated;
  }

  private async syncOrderFulfillment(
    tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
    orderId: string,
  ) {
    const shipments = await tx.shipment.findMany({
      where: { orderId },
      select: { status: true },
    });

    const newStatus = computeOrderFulfillmentStatus(shipments);
    if (newStatus) {
      await tx.order.update({
        where: { id: orderId },
        data: { fulfillmentStatus: newStatus },
      });
    }
  }
}
