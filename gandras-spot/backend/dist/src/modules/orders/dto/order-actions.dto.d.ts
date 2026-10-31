import { OrderStatus } from '@prisma/client';
export declare class AcceptOrderDto {
    estimatedMinutes: number;
    internalNote?: string;
}
export declare class RejectOrderDto {
    reason?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    note?: string;
    internalNote?: string;
    driverId?: string;
}
