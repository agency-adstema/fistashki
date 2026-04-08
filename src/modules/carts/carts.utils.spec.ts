import { Prisma } from '@prisma/client';
import { recalculateCartTotals } from './carts.utils';

const d = (v: number | string) => new Prisma.Decimal(v);

describe('recalculateCartTotals', () => {
  it('calculates grandTotal = subtotal + shipping - discount', () => {
    const result = recalculateCartTotals(
      [{ totalPrice: 50 }, { totalPrice: 30 }],
      10,
      5,
    );
    expect(Number(result.subtotal)).toBe(80);
    expect(Number(result.shippingTotal)).toBe(10);
    expect(Number(result.discountTotal)).toBe(5);
    expect(Number(result.grandTotal)).toBe(85);
  });

  it('clamps grandTotal to 0 when discount exceeds subtotal + shipping', () => {
    const result = recalculateCartTotals([{ totalPrice: 10 }], 0, 50);
    expect(Number(result.grandTotal)).toBe(0);
  });

  it('returns zero subtotal for empty cart', () => {
    const result = recalculateCartTotals([], 0, 0);
    expect(Number(result.subtotal)).toBe(0);
    expect(Number(result.grandTotal)).toBe(0);
  });

  it('works with Decimal inputs', () => {
    const result = recalculateCartTotals(
      [{ totalPrice: d('19.99') }, { totalPrice: d('5.01') }],
      d('4.99'),
      d('2.00'),
    );
    expect(Number(result.subtotal)).toBe(25);
    expect(Number(result.grandTotal)).toBeCloseTo(27.99);
  });

  it('handles zero shipping and zero discount', () => {
    const result = recalculateCartTotals([{ totalPrice: 100 }], 0, 0);
    expect(Number(result.grandTotal)).toBe(100);
  });
});
