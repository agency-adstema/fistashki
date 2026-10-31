"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatOrderDisplayRef = formatOrderDisplayRef;
exports.orderDisplayId = orderDisplayId;
function formatOrderDisplayRef(date, monthlySequence) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const seq = String(monthlySequence).padStart(3, '0');
    return `${mm}-${seq}`;
}
function orderDisplayId(displayRef, orderNumber) {
    return displayRef ?? `#${orderNumber}`;
}
//# sourceMappingURL=order-display.util.js.map