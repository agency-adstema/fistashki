import { Prisma } from '@prisma/client';

export function generateOrderNumber(date: Date, counter: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const seq = String(counter).padStart(4, '0');
  return `ORD-${y}${m}${d}-${seq}`;
}

export function calculateOrderTotals(input: {
  lineTotals: Array<Prisma.Decimal>;
  shippingTotal?: number;
  discountTotal?: number;
}) {
  const subtotal = input.lineTotals.reduce(
    (sum, lt) => sum.add(lt),
    new Prisma.Decimal(0),
  );

  const shippingTotal = new Prisma.Decimal(input.shippingTotal ?? 0);
  const discountTotal = new Prisma.Decimal(input.discountTotal ?? 0);

  const rawGrandTotal = subtotal.add(shippingTotal).sub(discountTotal);
  const grandTotal = rawGrandTotal.lessThan(0) ? new Prisma.Decimal(0) : rawGrandTotal;

  return { subtotal, shippingTotal, discountTotal, grandTotal };
}

