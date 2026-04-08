import { Prisma } from '@prisma/client';
export interface CartTotals {
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    shippingTotal: Prisma.Decimal;
    grandTotal: Prisma.Decimal;
}
export declare function recalculateCartTotals(items: Array<{
    totalPrice: Prisma.Decimal | number | string;
}>, shippingTotal: Prisma.Decimal | number | string, discountTotal: Prisma.Decimal | number | string): CartTotals;
