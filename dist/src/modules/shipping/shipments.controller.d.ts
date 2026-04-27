import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { ShipmentsQueryDto } from './dto/shipments-query.dto';
export declare class ShipmentsController {
    private readonly service;
    constructor(service: ShipmentsService);
    create(dto: CreateShipmentDto, user: any): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    findAll(query: ShipmentsQueryDto): Promise<{
        message: string;
        data: {
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
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    updateStatus(id: string, dto: UpdateShipmentStatusDto, user: any): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    updateTracking(id: string, dto: UpdateTrackingDto, user: any): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    markShipped(id: string, user: any): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    markDelivered(id: string, user: any): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    markReturned(id: string, user: any): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
    cancel(id: string, user: any): Promise<{
        message: string;
        data: {
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        };
    }>;
}
