import { ReturnStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
export declare const RETURN_STATUS_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]>;
export declare function assertReturnStatusTransition(from: ReturnStatus, to: ReturnStatus): void;
export interface ReturnItemCheck {
    orderItemId: string;
    quantity: number;
}
export interface OrderItemInfo {
    id: string;
    quantity: number;
}
export interface ExistingReturnItemInfo {
    orderItemId: string;
    quantity: number;
}
export declare function validateReturnQuantities(newItems: ReturnItemCheck[], orderItems: OrderItemInfo[], existingReturnItems: ExistingReturnItemInfo[]): string[];
export declare function calculateReturnTotal(items: Array<{
    totalAmount: Prisma.Decimal | number | string;
}>): Prisma.Decimal;
