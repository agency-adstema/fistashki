import { BadRequestException } from '@nestjs/common';
import { ShipmentStatus, FulfillmentStatus } from '@prisma/client';

export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatus.PENDING]: [ShipmentStatus.READY_TO_SHIP, ShipmentStatus.CANCELLED],
  [ShipmentStatus.READY_TO_SHIP]: [ShipmentStatus.SHIPPED, ShipmentStatus.CANCELLED],
  [ShipmentStatus.SHIPPED]: [
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.DELIVERED,
    ShipmentStatus.CANCELLED,
  ],
  [ShipmentStatus.IN_TRANSIT]: [
    ShipmentStatus.DELIVERED,
    ShipmentStatus.RETURNED,
    ShipmentStatus.LOST,
    ShipmentStatus.CANCELLED,
  ],
  [ShipmentStatus.DELIVERED]: [ShipmentStatus.RETURNED],
  [ShipmentStatus.RETURNED]: [],
  [ShipmentStatus.LOST]: [],
  [ShipmentStatus.CANCELLED]: [],
};

export function assertShipmentStatusTransition(
  from: ShipmentStatus,
  to: ShipmentStatus,
): void {
  if (!SHIPMENT_STATUS_TRANSITIONS[from]?.includes(to)) {
    throw new BadRequestException(
      `Invalid shipment status transition: ${from} → ${to}`,
    );
  }
}

/**
 * Computes the order fulfillment status from all non-cancelled shipments.
 * Returns null when no meaningful update is warranted.
 */
export function computeOrderFulfillmentStatus(
  shipments: Array<{ status: ShipmentStatus }>,
): FulfillmentStatus | null {
  const active = shipments.filter((s) => s.status !== ShipmentStatus.CANCELLED);
  if (active.length === 0) return null;

  if (active.every((s) => s.status === ShipmentStatus.DELIVERED)) {
    return FulfillmentStatus.FULFILLED;
  }

  const allSettled = active.every(
    (s) =>
      s.status === ShipmentStatus.RETURNED ||
      s.status === ShipmentStatus.DELIVERED ||
      s.status === ShipmentStatus.LOST,
  );
  if (allSettled) return FulfillmentStatus.RETURNED;

  const dispatched = new Set<ShipmentStatus>([
    ShipmentStatus.SHIPPED,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.DELIVERED,
  ]);
  const anyDispatched = active.some((s) => dispatched.has(s.status));
  if (anyDispatched) return FulfillmentStatus.PARTIALLY_FULFILLED;

  return null;
}
