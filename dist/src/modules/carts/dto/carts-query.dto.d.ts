import { CartStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CartsQueryDto extends PaginationDto {
    status?: CartStatus;
    customerId?: string;
    sessionId?: string;
}
