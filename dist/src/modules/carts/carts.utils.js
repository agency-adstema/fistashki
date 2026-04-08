"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateCartTotals = recalculateCartTotals;
const client_1 = require("@prisma/client");
function recalculateCartTotals(items, shippingTotal, discountTotal) {
    const subtotal = items.reduce((sum, item) => sum.add(new client_1.Prisma.Decimal(item.totalPrice)), new client_1.Prisma.Decimal(0));
    const shipping = new client_1.Prisma.Decimal(shippingTotal);
    const discount = new client_1.Prisma.Decimal(discountTotal);
    const raw = subtotal.add(shipping).sub(discount);
    const grandTotal = raw.lessThan(0) ? new client_1.Prisma.Decimal(0) : raw;
    return { subtotal, discountTotal: discount, shippingTotal: shipping, grandTotal };
}
//# sourceMappingURL=carts.utils.js.map