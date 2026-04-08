import { BadRequestException } from '@nestjs/common';
import { CouponType, Prisma } from '@prisma/client';
import { calculateDiscount } from './coupons.utils';

const d = (v: number | string) => new Prisma.Decimal(v);

describe('calculateDiscount', () => {
  it('calculates percentage discount correctly', () => {
    const result = calculateDiscount(
      { type: CouponType.PERCENTAGE, value: 20 },
      d(100),
    );
    expect(Number(result)).toBe(20);
  });

  it('calculates fixed discount correctly', () => {
    const result = calculateDiscount(
      { type: CouponType.FIXED, value: 15 },
      d(100),
    );
    expect(Number(result)).toBe(15);
  });

  it('caps percentage discount by maxDiscountAmount', () => {
    const result = calculateDiscount(
      { type: CouponType.PERCENTAGE, value: 50, maxDiscountAmount: 10 },
      d(100),
    );
    expect(Number(result)).toBe(10); // 50% of 100 = 50, capped at 10
  });

  it('caps fixed discount at subtotal', () => {
    const result = calculateDiscount(
      { type: CouponType.FIXED, value: 200 },
      d(50),
    );
    expect(Number(result)).toBe(50); // cannot exceed subtotal
  });

  it('caps percentage discount at subtotal', () => {
    const result = calculateDiscount(
      { type: CouponType.PERCENTAGE, value: 100, maxDiscountAmount: 9999 },
      d(80),
    );
    expect(Number(result)).toBe(80);
  });

  it('throws when subtotal is below minOrderAmount', () => {
    expect(() =>
      calculateDiscount(
        { type: CouponType.FIXED, value: 10, minOrderAmount: 50 },
        d(30),
      ),
    ).toThrow(BadRequestException);
  });

  it('allows discount when subtotal equals minOrderAmount exactly', () => {
    const result = calculateDiscount(
      { type: CouponType.FIXED, value: 5, minOrderAmount: 50 },
      d(50),
    );
    expect(Number(result)).toBe(5);
  });

  it('returns 0 for 0% percentage coupon', () => {
    const result = calculateDiscount(
      { type: CouponType.PERCENTAGE, value: 0 },
      d(100),
    );
    expect(Number(result)).toBe(0);
  });
});
