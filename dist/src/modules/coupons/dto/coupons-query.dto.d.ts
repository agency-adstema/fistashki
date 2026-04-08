import { CouponType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CouponsQueryDto extends PaginationDto {
    type?: CouponType;
    isActive?: boolean;
}
