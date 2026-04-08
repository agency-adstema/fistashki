"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRefund = calculateRefund;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
function calculateRefund(paymentAmount, currentRefundedAmount, refundAmount) {
    const remaining = paymentAmount.sub(currentRefundedAmount);
    if (refundAmount.lessThanOrEqualTo(0)) {
        throw new common_1.BadRequestException('Refund amount must be greater than 0');
    }
    if (refundAmount.greaterThan(remaining)) {
        throw new common_1.BadRequestException(`Refund amount (${refundAmount}) exceeds remaining refundable amount (${remaining})`);
    }
    const newRefundedAmount = currentRefundedAmount.add(refundAmount);
    const isFull = newRefundedAmount.equals(paymentAmount);
    return {
        newRefundedAmount,
        newStatus: isFull ? client_1.PaymentRecordStatus.REFUNDED : client_1.PaymentRecordStatus.PARTIALLY_REFUNDED,
        refundedAt: isFull ? new Date() : null,
    };
}
//# sourceMappingURL=payments.utils.js.map