import { BadRequestException } from '@nestjs/common';
import { Prisma, PaymentRecordStatus } from '@prisma/client';

export interface RefundResult {
  newRefundedAmount: Prisma.Decimal;
  newStatus: PaymentRecordStatus;
  refundedAt: Date | null;
}

/**
 * Pure calculation: determines how a refund changes refundedAmount and status.
 * Throws BadRequestException if the refund amount is invalid.
 */
export function calculateRefund(
  paymentAmount: Prisma.Decimal,
  currentRefundedAmount: Prisma.Decimal,
  refundAmount: Prisma.Decimal,
): RefundResult {
  const remaining = paymentAmount.sub(currentRefundedAmount);

  if (refundAmount.lessThanOrEqualTo(0)) {
    throw new BadRequestException('Refund amount must be greater than 0');
  }

  if (refundAmount.greaterThan(remaining)) {
    throw new BadRequestException(
      `Refund amount (${refundAmount}) exceeds remaining refundable amount (${remaining})`,
    );
  }

  const newRefundedAmount = currentRefundedAmount.add(refundAmount);
  const isFull = newRefundedAmount.equals(paymentAmount);

  return {
    newRefundedAmount,
    newStatus: isFull ? PaymentRecordStatus.REFUNDED : PaymentRecordStatus.PARTIALLY_REFUNDED,
    refundedAt: isFull ? new Date() : null,
  };
}
