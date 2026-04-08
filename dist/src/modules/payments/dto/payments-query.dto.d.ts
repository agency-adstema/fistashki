import { PaymentMethod, PaymentProvider, PaymentRecordStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class PaymentsQueryDto extends PaginationDto {
    orderId?: string;
    orderNumber?: string;
    status?: PaymentRecordStatus;
    method?: PaymentMethod;
    provider?: PaymentProvider;
    dateFrom?: string;
    dateTo?: string;
}
