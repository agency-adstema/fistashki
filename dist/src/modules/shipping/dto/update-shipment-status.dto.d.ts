import { ShipmentStatus } from '@prisma/client';
export declare class UpdateShipmentStatusDto {
    status: ShipmentStatus;
    notes?: string;
}
