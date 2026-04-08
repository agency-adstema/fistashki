import { Prisma } from '@prisma/client';

export interface CartTotals {
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  shippingTotal: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
}

/**
 * Pure function: recomputes cart totals from item line totals + fixed charges.
 */
export function recalculateCartTotals(
  items: Array<{ totalPrice: Prisma.Decimal | number | string }>,
  shippingTotal: Prisma.Decimal | number | string,
  discountTotal: Prisma.Decimal | number | string,
): CartTotals {
  const subtotal = items.reduce(
    (sum, item) => sum.add(new Prisma.Decimal(item.totalPrice)),
    new Prisma.Decimal(0),
  );

  const shipping = new Prisma.Decimal(shippingTotal);
  const discount = new Prisma.Decimal(discountTotal);

  const raw = subtotal.add(shipping).sub(discount);
  const grandTotal = raw.lessThan(0) ? new Prisma.Decimal(0) : raw;

  return { subtotal, discountTotal: discount, shippingTotal: shipping, grandTotal };
}
