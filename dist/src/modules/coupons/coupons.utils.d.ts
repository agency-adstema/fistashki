import { CouponType, Prisma } from '@prisma/client';
export interface DiscountInput {
    type: CouponType;
    value: Prisma.Decimal | number | string;
    maxDiscountAmount?: Prisma.Decimal | number | string | null;
    minOrderAmount?: Prisma.Decimal | number | string | null;
}
export declare function calculateDiscount(coupon: DiscountInput, subtotal: Prisma.Decimal): Prisma.Decimal;
