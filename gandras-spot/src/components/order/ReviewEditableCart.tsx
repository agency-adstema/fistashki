"use client";

import { Trash2 } from "lucide-react";
import { useOrderStore } from "@/store/order-store";
import { useMenuStore } from "@/store/menu-store";
import { calcCartLineTotal, getCartLineSubItems, getCartLineTitle } from "@/lib/cart-line";
import { QuantityControl } from "@/components/order/QuantityControl";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  compact?: boolean;
};

export function ReviewEditableCart({ compact = false }: Props) {
  const cartLines = useOrderStore((s) => s.draft.cartLines);
  const drinkQty = useOrderStore((s) => s.draft.drinkQty);
  const removeCartLine = useOrderStore((s) => s.removeCartLine);
  const setDrinkQty = useOrderStore((s) => s.setDrinkQty);
  const drinks = useMenuStore((s) => s.drinks);

  const selectedDrinks = drinks.filter((d) => (drinkQty[d.id] ?? 0) > 0);
  const empty = cartLines.length === 0 && selectedDrinks.length === 0;

  if (empty) {
    return (
      <p className={cn("text-sm", compact ? "text-gray-400" : "text-gray-500")}>
        Još nema stavki
      </p>
    );
  }

  const removeBtn = compact ? "h-7 w-7" : "h-8 w-8";
  const removeIcon = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {cartLines.map((line, index) => {
        const title = getCartLineTitle(line);
        const subItems = getCartLineSubItems(line);
        const lineTotal = calcCartLineTotal(line);
        const lineLabel = cartLines.length > 1 ? `Stavka ${index + 1}` : null;

        return (
          <div
            key={line.lineId}
            className={cn(
              "rounded-xl border border-gray-100 bg-white",
              compact ? "p-2.5" : "p-3 sm:p-4",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {lineLabel && (
                  <p
                    className={cn(
                      "font-bold",
                      compact ? "text-xs text-[#FFB800]" : "text-sm text-gray-500",
                    )}
                  >
                    {lineLabel}
                  </p>
                )}
                <p
                  className={cn(
                    "font-semibold text-black",
                    compact ? "text-sm" : "text-base",
                  )}
                >
                  {title}
                </p>
                {!compact && subItems.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {subItems.map((item) => (
                      <li key={item.name} className="text-sm text-gray-500">
                        + {item.name}
                        <span className="ml-1 tabular-nums">({formatPrice(item.price)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={cn(
                    "font-semibold tabular-nums text-black",
                    compact ? "text-sm" : "text-base",
                  )}
                >
                  {formatPrice(lineTotal)}
                </span>
                <button
                  type="button"
                  aria-label={`Ukloni ${title}`}
                  onClick={() => removeCartLine(line.lineId)}
                  className={cn(
                    "flex items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600",
                    removeBtn,
                  )}
                >
                  <Trash2 className={removeIcon} />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {selectedDrinks.length > 0 && (
        <div>
          <p
            className={cn(
              "font-bold",
              compact ? "mb-1.5 text-xs text-[#FFB800]" : "mb-2 text-base text-black",
            )}
          >
            Napitak
          </p>
          <ul className={compact ? "space-y-2" : "space-y-2"}>
            {selectedDrinks.map((drink) => {
              const qty = drinkQty[drink.id] ?? 0;
              return (
                <li
                  key={drink.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white",
                    compact ? "px-2.5 py-2" : "px-3 py-2.5 sm:px-4 sm:py-3",
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn("font-semibold", compact ? "text-sm text-gray-800" : "text-black")}>
                      {drink.name}
                    </p>
                    {!compact && (
                      <p className="text-xs text-gray-500">{formatPrice(drink.price)} / kom</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!compact && (
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(drink.price * qty)}
                      </span>
                    )}
                    <QuantityControl
                      compact={compact}
                      value={qty}
                      onChange={(q) => setDrinkQty(drink.id, q)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
