import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class ProductsQueryDto extends PaginationDto {
    status?: ProductStatus;
}
