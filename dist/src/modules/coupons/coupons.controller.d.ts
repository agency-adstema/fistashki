import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponsQueryDto } from './dto/coupons-query.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    create(dto: CreateCouponDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    findAll(query: CouponsQueryDto): Promise<{
        message: string;
        data: {
            items: any[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: any;
    }>;
    update(id: string, dto: UpdateCouponDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            deleted: boolean;
        };
    }>;
}
