"use client";

import { formatPrice } from "@/lib/utils";
import { toDeliveryMainItems } from "@/lib/order-items";

type DeliveryItemInput = {
  name: string;
  quantity?: number;
  totalPrice?: number;
  kind?: string | null;
  options?: Record<string, unknown> | null;
};

type Props = {
  items: DeliveryItemInput[];
};

/** Samo glavni proizvodi + cena (za dostavu / kurira). */
export function DeliveryItemsList({ items }: Props) {
  const main = toDeliveryMainItems(items);

  if (main.length === 0) {
    return <p className="text-sm text-gray-500">Nema stavki</p>;
  }

  return (
    <ul className="space-y-1.5">
      {main.map((item, i) => {
        const label =
          item.quantity && item.quantity > 1 ? `${item.quantity}× ${item.name}` : item.name;
        return (
          <li
            key={`${item.name}-${i}`}
            className="flex justify-between gap-3 text-sm font-semibold text-gray-100"
          >
            <span className="min-w-0">{label}</span>
            {item.totalPrice > 0 && (
              <span className="shrink-0 tabular-nums text-[#FFB800]">
                {formatPrice(item.totalPrice)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
