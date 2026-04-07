import { Prisma } from '@prisma/client';
import { calculateOrderTotals, generateOrderNumber } from './orders.utils';

describe('orders.utils', () => {
  describe('generateOrderNumber', () => {
    it('formats order number with date and sequence', () => {
      const date = new Date('2026-04-07T10:00:00.000Z');
      expect(generateOrderNumber(date, 1)).toBe('ORD-20260407-0001');
      expect(generateOrderNumber(date, 12)).toBe('ORD-20260407-0012');
      expect(generateOrderNumber(date, 1234)).toBe('ORD-20260407-1234');
    });
  });

  describe('calculateOrderTotals', () => {
    it('calculates subtotal and grand total', () => {
      const t = calculateOrderTotals({
        lineTotals: [new Prisma.Decimal(10), new Prisma.Decimal(5.5)],
        shippingTotal: 2,
        discountTotal: 1.5,
      });

      expect(Number(t.subtotal)).toBeCloseTo(15.5);
      expect(Number(t.shippingTotal)).toBeCloseTo(2);
      expect(Number(t.discountTotal)).toBeCloseTo(1.5);
      expect(Number(t.grandTotal)).toBeCloseTo(16);
    });

    it('clamps grand total to 0 when discounts exceed subtotal', () => {
      const t = calculateOrderTotals({
        lineTotals: [new Prisma.Decimal(10)],
        shippingTotal: 0,
        discountTotal: 50,
      });

      expect(Number(t.subtotal)).toBeCloseTo(10);
      expect(Number(t.grandTotal)).toBeCloseTo(0);
    });
  });
});

