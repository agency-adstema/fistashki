import { Prisma } from '@prisma/client';
export declare function generateOrderNumber(date: Date, counter: number): string;
export declare function calculateOrderTotals(input: {
    lineTotals: Array<Prisma.Decimal>;
    shippingTotal?: number;
    discountTotal?: number;
}): {
    subtotal: Prisma.Decimal;
    shippingTotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    grandTotal: Prisma.Decimal;
};
