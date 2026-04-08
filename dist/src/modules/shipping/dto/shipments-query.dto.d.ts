import { ShipmentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class ShipmentsQueryDto extends PaginationDto {
    orderId?: string;
    orderNumber?: string;
    status?: ShipmentStatus;
    courier?: string;
    trackingNumber?: string;
    dateFrom?: string;
    dateTo?: string;
}
