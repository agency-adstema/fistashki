"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETURN_STATUS_TRANSITIONS = void 0;
exports.assertReturnStatusTransition = assertReturnStatusTransition;
exports.validateReturnQuantities = validateReturnQuantities;
exports.calculateReturnTotal = calculateReturnTotal;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
exports.RETURN_STATUS_TRANSITIONS = {
    [client_1.ReturnStatus.REQUESTED]: [
        client_1.ReturnStatus.APPROVED,
        client_1.ReturnStatus.REJECTED,
        client_1.ReturnStatus.CANCELLED,
    ],
    [client_1.ReturnStatus.APPROVED]: [client_1.ReturnStatus.RECEIVED, client_1.ReturnStatus.CANCELLED],
    [client_1.ReturnStatus.RECEIVED]: [
        client_1.ReturnStatus.REFUND_PENDING,
        client_1.ReturnStatus.REFUNDED,
        client_1.ReturnStatus.COMPLETED,
    ],
    [client_1.ReturnStatus.REFUND_PENDING]: [client_1.ReturnStatus.REFUNDED],
    [client_1.ReturnStatus.REFUNDED]: [client_1.ReturnStatus.COMPLETED],
    [client_1.ReturnStatus.REJECTED]: [],
    [client_1.ReturnStatus.COMPLETED]: [],
    [client_1.ReturnStatus.CANCELLED]: [],
};
function assertReturnStatusTransition(from, to) {
    const allowed = exports.RETURN_STATUS_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
        throw new common_1.BadRequestException(`Invalid return status transition: ${from} → ${to}. Allowed: ${allowed.join(', ') || 'none'}`);
    }
}
function validateReturnQuantities(newItems, orderItems, existingReturnItems) {
    const errors = [];
    for (const newItem of newItems) {
        const orderItem = orderItems.find((oi) => oi.id === newItem.orderItemId);
        if (!orderItem) {
            errors.push(`Order item ${newItem.orderItemId} not found on this order`);
            continue;
        }
        const alreadyReturned = existingReturnItems
            .filter((ri) => ri.orderItemId === newItem.orderItemId)
            .reduce((sum, ri) => sum + ri.quantity, 0);
        const total = newItem.quantity + alreadyReturned;
        if (total > orderItem.quantity) {
            errors.push(`Return quantity ${total} exceeds ordered quantity ${orderItem.quantity} for order item ${newItem.orderItemId}`);
        }
    }
    return errors;
}
function calculateReturnTotal(items) {
    return items.reduce((sum, item) => sum.add(new client_2.Prisma.Decimal(item.totalAmount.toString())), new client_2.Prisma.Decimal(0));
}
//# sourceMappingURL=returns.utils.js.map