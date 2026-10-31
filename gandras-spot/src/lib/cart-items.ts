import type { OrderLineItem } from "@/lib/order-items";

export function cartItemsToOrderLines(
  items: Array<{ name: string; price: number; kind?: string; quantity?: number }>,
): OrderLineItem[] {
  return items.map((item) => ({
    name: item.name,
    totalPrice: item.price,
    kind: item.kind,
    quantity: item.quantity,
  }));
}
