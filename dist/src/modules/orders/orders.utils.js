"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNumber = generateOrderNumber;
exports.calculateOrderTotals = calculateOrderTotals;
const client_1 = require("@prisma/client");
function generateOrderNumber(date, counter) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const seq = String(counter).padStart(4, '0');
    return `ORD-${y}${m}${d}-${seq}`;
}
function calculateOrderTotals(input) {
    const subtotal = input.lineTotals.reduce((sum, lt) => sum.add(lt), new client_1.Prisma.Decimal(0));
    const shippingTotal = new client_1.Prisma.Decimal(input.shippingTotal ?? 0);
    const discountTotal = new client_1.Prisma.Decimal(input.discountTotal ?? 0);
    const rawGrandTotal = subtotal.add(shippingTotal).sub(discountTotal);
    const grandTotal = rawGrandTotal.lessThan(0) ? new client_1.Prisma.Decimal(0) : rawGrandTotal;
    return { subtotal, shippingTotal, discountTotal, grandTotal };
}
//# sourceMappingURL=orders.utils.js.map