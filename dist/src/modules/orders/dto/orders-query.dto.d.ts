import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class OrdersQueryDto extends PaginationDto {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    customerId?: string;
}
