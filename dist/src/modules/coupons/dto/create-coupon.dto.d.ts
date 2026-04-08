import { CouponType } from '@prisma/client';
export declare class CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    currency?: string;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    isActive?: boolean;
    validFrom: string;
    validTo: string;
}
