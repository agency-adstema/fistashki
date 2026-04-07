import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CustomersQueryDto extends PaginationDto {
    search?: string;
    isActive?: boolean;
}
