"use client";

import { calcTotals, draftForTotals, useOrderStore } from "@/store/order-store";
import { ReviewEditableCart } from "@/components/order/ReviewEditableCart";
import { useMenuStore } from "@/store/menu-store";
import { useShopSettings } from "@/store/restaurant-store";
import { formatDeliveryLine } from "@/lib/order-pricing";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OrderItemsList } from "@/components/order/OrderItemsList";
import { cartItemsToOrderLines } from "@/lib/cart-items";

export function OrderSummary() {
  const step = useOrderStore((s) => s.step);
  const draft = useOrderStore((s) => s.draft);
  const settings = useShopSettings();
  useMenuStore((s) => s.loaded);
  const pricingDraft = draftForTotals(draft);
  const { items, subtotal, deliveryFee, tax, total } = calcTotals(pricingDraft, settings);
  const vatPercent = Math.round(settings.taxRate * 100);
  const vatLabel =
    settings.taxRate > 0 ? `PDV uključen (${vatPercent}%)` : "PDV";

  return (
    <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase tracking-wider text-black">
        Vaša porudžbina
      </h3>
      <div className="mt-4">
        {step === 5 ? (
          <ReviewEditableCart compact />
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">Još nema stavki</p>
        ) : (
          <OrderItemsList items={cartItemsToOrderLines(items)} />
        )}
      </div>
      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Međuzbir</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Dostava</span>
          <span>
            {formatDeliveryLine(
              draft.deliveryMethod,
              deliveryFee,
              subtotal,
              settings.freeDeliveryMin,
            )}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>{vatLabel}</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-black text-black">
          <span>UKUPNO</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <Button className="mt-6 w-full" size="lg" disabled>
        ZAVRŠI PORUDŽBINU
      </Button>
    </div>
  );
}
