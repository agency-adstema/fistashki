import { Prisma, PaymentRecordStatus } from '@prisma/client';
export interface RefundResult {
    newRefundedAmount: Prisma.Decimal;
    newStatus: PaymentRecordStatus;
    refundedAt: Date | null;
}
export declare function calculateRefund(paymentAmount: Prisma.Decimal, currentRefundedAmount: Prisma.Decimal, refundAmount: Prisma.Decimal): RefundResult;
