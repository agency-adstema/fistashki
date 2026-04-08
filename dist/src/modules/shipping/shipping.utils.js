"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIPMENT_STATUS_TRANSITIONS = void 0;
exports.assertShipmentStatusTransition = assertShipmentStatusTransition;
exports.computeOrderFulfillmentStatus = computeOrderFulfillmentStatus;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
exports.SHIPMENT_STATUS_TRANSITIONS = {
    [client_1.ShipmentStatus.PENDING]: [client_1.ShipmentStatus.READY_TO_SHIP, client_1.ShipmentStatus.CANCELLED],
    [client_1.ShipmentStatus.READY_TO_SHIP]: [client_1.ShipmentStatus.SHIPPED, client_1.ShipmentStatus.CANCELLED],
    [client_1.ShipmentStatus.SHIPPED]: [
        client_1.ShipmentStatus.IN_TRANSIT,
        client_1.ShipmentStatus.DELIVERED,
        client_1.ShipmentStatus.CANCELLED,
    ],
    [client_1.ShipmentStatus.IN_TRANSIT]: [
        client_1.ShipmentStatus.DELIVERED,
        client_1.ShipmentStatus.RETURNED,
        client_1.ShipmentStatus.LOST,
        client_1.ShipmentStatus.CANCELLED,
    ],
    [client_1.ShipmentStatus.DELIVERED]: [client_1.ShipmentStatus.RETURNED],
    [client_1.ShipmentStatus.RETURNED]: [],
    [client_1.ShipmentStatus.LOST]: [],
    [client_1.ShipmentStatus.CANCELLED]: [],
};
function assertShipmentStatusTransition(from, to) {
    if (!exports.SHIPMENT_STATUS_TRANSITIONS[from]?.includes(to)) {
        throw new common_1.BadRequestException(`Invalid shipment status transition: ${from} → ${to}`);
    }
}
function computeOrderFulfillmentStatus(shipments) {
    const active = shipments.filter((s) => s.status !== client_1.ShipmentStatus.CANCELLED);
    if (active.length === 0)
        return null;
    if (active.every((s) => s.status === client_1.ShipmentStatus.DELIVERED)) {
        return client_1.FulfillmentStatus.FULFILLED;
    }
    const allSettled = active.every((s) => s.status === client_1.ShipmentStatus.RETURNED ||
        s.status === client_1.ShipmentStatus.DELIVERED ||
        s.status === client_1.ShipmentStatus.LOST);
    if (allSettled)
        return client_1.FulfillmentStatus.RETURNED;
    const dispatched = new Set([
        client_1.ShipmentStatus.SHIPPED,
        client_1.ShipmentStatus.IN_TRANSIT,
        client_1.ShipmentStatus.DELIVERED,
    ]);
    const anyDispatched = active.some((s) => dispatched.has(s.status));
    if (anyDispatched)
        return client_1.FulfillmentStatus.PARTIALLY_FULFILLED;
    return null;
}
//# sourceMappingURL=shipping.utils.js.map