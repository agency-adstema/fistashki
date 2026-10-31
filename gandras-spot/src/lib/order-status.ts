export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Primljena",
  ACCEPTED: "Prihvaćena",
  IN_PREPARATION: "U pripremi",
  READY: "Spremna",
  OUT_FOR_DELIVERY: "Na dostavi",
  COMPLETED: "Završena",
  CANCELLED: "Otkazana",
  REJECTED: "Odbijena",
};

export const TERMINAL_ORDER_STATUSES = ["COMPLETED", "CANCELLED", "REJECTED"] as const;

export const PICKUP_ORDER_TIMELINE = [
  "NEW",
  "ACCEPTED",
  "IN_PREPARATION",
  "READY",
  "COMPLETED",
] as const;

export const DELIVERY_ORDER_TIMELINE = [
  "NEW",
  "ACCEPTED",
  "IN_PREPARATION",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
] as const;

export function orderTimeline(deliveryMethod: string) {
  return deliveryMethod === "DELIVERY" ? DELIVERY_ORDER_TIMELINE : PICKUP_ORDER_TIMELINE;
}

export function canCompleteOrder(order: { deliveryMethod: string; status: string }): boolean {
  if (order.status === "READY" && order.deliveryMethod === "PICKUP") return true;
  if (order.status === "OUT_FOR_DELIVERY" && order.deliveryMethod === "DELIVERY") return true;
  return false;
}

export function isActiveOrderStatus(status: string): boolean {
  return !TERMINAL_ORDER_STATUSES.includes(status as (typeof TERMINAL_ORDER_STATUSES)[number]);
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
