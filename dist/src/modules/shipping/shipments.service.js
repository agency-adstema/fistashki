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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const shipping_utils_1 = require("./shipping.utils");
const SHIPMENT_INCLUDE = {
    order: { select: { id: true, orderNumber: true, fulfillmentStatus: true } },
    shippingMethod: { select: { id: true, key: true, name: true } },
};
let ShipmentsService = class ShipmentsService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async create(dto, actorUserId) {
        const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot create a shipment for a cancelled order');
        }
        if (dto.shippingMethodId) {
            const method = await this.prisma.shippingMethod.findUnique({
                where: { id: dto.shippingMethodId },
            });
            if (!method)
                throw new common_1.NotFoundException('Shipping method not found');
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
                metadata: dto.metadata,
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
    async findAll(query) {
        const { page = 1, limit = 50, orderId, orderNumber, status, courier, trackingNumber, dateFrom, dateTo, } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (orderId)
            where.orderId = orderId;
        if (orderNumber)
            where.order = { orderNumber: { contains: orderNumber, mode: 'insensitive' } };
        if (status)
            where.status = status;
        if (courier)
            where.courier = { contains: courier, mode: 'insensitive' };
        if (trackingNumber)
            where.trackingNumber = { contains: trackingNumber, mode: 'insensitive' };
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
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
    async findOne(id) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id },
            include: SHIPMENT_INCLUDE,
        });
        if (!shipment)
            throw new common_1.NotFoundException('Shipment not found');
        return shipment;
    }
    async updateStatus(id, dto, actorUserId) {
        const shipment = await this.findOne(id);
        (0, shipping_utils_1.assertShipmentStatusTransition)(shipment.status, dto.status);
        const data = { status: dto.status };
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        if (dto.status === client_1.ShipmentStatus.SHIPPED)
            data.shippedAt = new Date();
        if (dto.status === client_1.ShipmentStatus.DELIVERED)
            data.deliveredAt = new Date();
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
    async updateTracking(id, dto, actorUserId) {
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
            metadata: dto,
        });
        return updated;
    }
    async markShipped(id, actorUserId) {
        const shipment = await this.findOne(id);
        (0, shipping_utils_1.assertShipmentStatusTransition)(shipment.status, client_1.ShipmentStatus.SHIPPED);
        const updated = await this.prisma.$transaction(async (tx) => {
            const s = await tx.shipment.update({
                where: { id },
                data: { status: client_1.ShipmentStatus.SHIPPED, shippedAt: new Date() },
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
    async markDelivered(id, actorUserId) {
        const shipment = await this.findOne(id);
        (0, shipping_utils_1.assertShipmentStatusTransition)(shipment.status, client_1.ShipmentStatus.DELIVERED);
        const updated = await this.prisma.$transaction(async (tx) => {
            const s = await tx.shipment.update({
                where: { id },
                data: { status: client_1.ShipmentStatus.DELIVERED, deliveredAt: new Date() },
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
    async markReturned(id, actorUserId) {
        const shipment = await this.findOne(id);
        (0, shipping_utils_1.assertShipmentStatusTransition)(shipment.status, client_1.ShipmentStatus.RETURNED);
        const updated = await this.prisma.$transaction(async (tx) => {
            const s = await tx.shipment.update({
                where: { id },
                data: { status: client_1.ShipmentStatus.RETURNED },
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
    async cancel(id, actorUserId) {
        const shipment = await this.findOne(id);
        (0, shipping_utils_1.assertShipmentStatusTransition)(shipment.status, client_1.ShipmentStatus.CANCELLED);
        const updated = await this.prisma.shipment.update({
            where: { id },
            data: { status: client_1.ShipmentStatus.CANCELLED },
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
    async syncOrderFulfillment(tx, orderId) {
        const shipments = await tx.shipment.findMany({
            where: { orderId },
            select: { status: true },
        });
        const newStatus = (0, shipping_utils_1.computeOrderFulfillmentStatus)(shipments);
        if (newStatus) {
            await tx.order.update({
                where: { id: orderId },
                data: { fulfillmentStatus: newStatus },
            });
        }
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map