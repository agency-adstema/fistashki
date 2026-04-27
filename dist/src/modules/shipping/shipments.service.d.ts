import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { ShipmentsQueryDto } from './dto/shipments-query.dto';
export declare class ShipmentsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    create(dto: CreateShipmentDto, actorUserId?: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    findAll(query: ShipmentsQueryDto): Promise<{
        items: ({
            order: {
                id: string;
                orderNumber: string;
                fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
            };
            shippingMethod: {
                id: string;
                name: string;
                key: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: Prisma.JsonValue | null;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            orderId: string;
            notes: string | null;
            shippingMethodId: string | null;
            courier: string | null;
            service: string | null;
            trackingNumber: string | null;
            trackingUrl: string | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdateShipmentStatusDto, actorUserId?: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    updateTracking(id: string, dto: UpdateTrackingDto, actorUserId?: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    markShipped(id: string, actorUserId?: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    markDelivered(id: string, actorUserId?: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    markReturned(id: string, actorUserId?: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    cancel(id: string, actorUserId?: string): Promise<{
        order: {
            id: string;
            orderNumber: string;
            fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
        };
        shippingMethod: {
            id: string;
            name: string;
            key: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        orderId: string;
        notes: string | null;
        shippingMethodId: string | null;
        courier: string | null;
        service: string | null;
        trackingNumber: string | null;
        trackingUrl: string | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    private syncOrderFulfillment;
}
