import { ShipmentStatus, FulfillmentStatus } from '@prisma/client';
export declare const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]>;
export declare function assertShipmentStatusTransition(from: ShipmentStatus, to: ShipmentStatus): void;
export declare function computeOrderFulfillmentStatus(shipments: Array<{
    status: ShipmentStatus;
}>): FulfillmentStatus | null;
