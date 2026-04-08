import { ReturnStatus } from '@prisma/client';
export declare class ReturnsQueryDto {
    page?: number;
    limit?: number;
    orderId?: string;
    orderNumber?: string;
    status?: ReturnStatus;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
}
