import { BadRequestException } from '@nestjs/common';
import { CouponType, Prisma } from '@prisma/client';

export interface DiscountInput {
  type: CouponType;
  value: Prisma.Decimal | number | string;
  maxDiscountAmount?: Prisma.Decimal | number | string | null;
  minOrderAmount?: Prisma.Decimal | number | string | null;
}

/**
 * Pure function: calculates the discount amount for a given coupon and subtotal.
 * Throws BadRequestException if minOrderAmount is not met.
 */
export function calculateDiscount(
  coupon: DiscountInput,
  subtotal: Prisma.Decimal,
): Prisma.Decimal {
  const min = coupon.minOrderAmount != null
    ? new Prisma.Decimal(coupon.minOrderAmount)
    : null;

  if (min && subtotal.lessThan(min)) {
    throw new BadRequestException(
      `Minimum order amount of ${min} is required to use this coupon`,
    );
  }

  const val = new Prisma.Decimal(coupon.value);
  let discount: Prisma.Decimal;

  if (coupon.type === CouponType.PERCENTAGE) {
    discount = subtotal.mul(val).div(100);
    if (coupon.maxDiscountAmount != null) {
      const cap = new Prisma.Decimal(coupon.maxDiscountAmount);
      if (discount.greaterThan(cap)) discount = cap;
    }
  } else {
    discount = val;
  }

  // Cannot exceed subtotal
  if (discount.greaterThan(subtotal)) {
    discount = subtotal;
  }

  return discount;
}
