import { BadRequestException } from '@nestjs/common';
import { Prisma, PaymentRecordStatus } from '@prisma/client';
import { calculateRefund } from './payments.utils';

const d = (v: number | string) => new Prisma.Decimal(v);

describe('calculateRefund', () => {
  it('full refund: returns REFUNDED status and refundedAt', () => {
    const result = calculateRefund(d(100), d(0), d(100));
    expect(result.newStatus).toBe(PaymentRecordStatus.REFUNDED);
    expect(Number(result.newRefundedAmount)).toBe(100);
    expect(result.refundedAt).not.toBeNull();
  });

  it('partial refund: returns PARTIALLY_REFUNDED and no refundedAt', () => {
    const result = calculateRefund(d(100), d(0), d(40));
    expect(result.newStatus).toBe(PaymentRecordStatus.PARTIALLY_REFUNDED);
    expect(Number(result.newRefundedAmount)).toBe(40);
    expect(result.refundedAt).toBeNull();
  });

  it('second partial refund completing the full amount: returns REFUNDED', () => {
    const result = calculateRefund(d(100), d(60), d(40));
    expect(result.newStatus).toBe(PaymentRecordStatus.REFUNDED);
    expect(Number(result.newRefundedAmount)).toBe(100);
    expect(result.refundedAt).not.toBeNull();
  });

  it('throws when refund exceeds remaining amount', () => {
    expect(() => calculateRefund(d(100), d(80), d(30))).toThrow(BadRequestException);
  });

  it('throws when refund amount is zero', () => {
    expect(() => calculateRefund(d(100), d(0), d(0))).toThrow(BadRequestException);
  });

  it('throws when refund amount is negative', () => {
    expect(() => calculateRefund(d(100), d(0), d(-10))).toThrow(BadRequestException);
  });
});
