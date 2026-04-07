import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class ProductsQueryDto extends PaginationDto {
    search?: string;
    status?: ProductStatus;
    isActive?: boolean;
    lowStock?: boolean;
}
