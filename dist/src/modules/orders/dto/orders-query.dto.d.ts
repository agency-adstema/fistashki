import { OrderStatus, PaymentStatus, FulfillmentStatus, OrderPriority } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class OrdersQueryDto extends PaginationDto {
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    assignedToUserId?: string;
    priority?: OrderPriority;
    tagId?: string;
}
