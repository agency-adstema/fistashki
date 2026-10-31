"use client";

import { formatPrice } from "@/lib/utils";
import { groupOrderItems, type OrderLineItem } from "@/lib/order-items";

type Props = {
  items: OrderLineItem[];
  compact?: boolean;
};

export function OrderItemsList({ items, compact = false }: Props) {
  const groups = groupOrderItems(items);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <div
              className={
                compact
                  ? "mb-1 flex justify-between gap-3 text-base font-bold text-[#FFB800]"
                  : "mb-1 flex justify-between gap-3 text-base font-bold text-black"
              }
            >
              <span>{group.title}</span>
              {group.titlePrice !== undefined && !compact && (
                <span className="shrink-0 tabular-nums">{formatPrice(group.titlePrice)}</span>
              )}
            </div>
          )}
          <ul className={compact ? "space-y-0.5" : "space-y-1"}>
            {group.items.map((item, ii) => (
              <li
                key={ii}
                className={
                  compact
                    ? "text-sm font-semibold text-gray-200"
                    : "flex justify-between gap-3 text-sm"
                }
              >
                {compact ? (
                  <span>{item.name}</span>
                ) : (
                  <>
                    <span className="min-w-0 text-gray-600">{item.name}</span>
                    <span className="shrink-0 tabular-nums text-gray-900">{formatPrice(item.totalPrice)}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
