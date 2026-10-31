"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Banknote } from "lucide-react";
import { calcTotals, useOrderStore } from "@/store/order-store";
import { useMenuStore } from "@/store/menu-store";
import { useRestaurantStore, useShopSettings } from "@/store/restaurant-store";
import { ordersApi } from "@/lib/api";
import { mapOrderError, formatDeliveryLine } from "@/lib/order-pricing";
import { getAvailablePaymentMethods } from "@/lib/payment-methods";
import { saveActiveOrder, orderTrackingPath } from "@/lib/active-order";
import { Button } from "@/components/ui/button";
import { OrderStepActions } from "@/components/order/OrderStepActions";
import { ReviewEditableCart } from "@/components/order/ReviewEditableCart";
import { QuantityControl } from "@/components/order/QuantityControl";
import { cn, formatPrice } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_OPTIONS = [
  { id: "cash" as PaymentMethod, icon: Banknote, label: "Gotovina" },
  { id: "card" as PaymentMethod, icon: CreditCard, label: "Kartica" },
] as const;

export function StepReview() {
  const router = useRouter();
  const settings = useShopSettings();
  const loaded = useRestaurantStore((s) => s.loaded);
  const loadRestaurant = useRestaurantStore((s) => s.loadRestaurant);
  const { draft, setPaymentMethod, resetDraft, setStep, setDrinkQty } = useOrderStore();
  const drinks = useMenuStore((s) => s.drinks);
  const { items, subtotal, deliveryFee, tax, total } = calcTotals(draft, settings);
  const vatPercent = Math.round(settings.taxRate * 100);
  const vatLabel =
    settings.taxRate > 0 ? `PDV uključen (${vatPercent}%)` : "PDV";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableIds = useMemo(() => getAvailablePaymentMethods(settings), [settings]);
  const availablePayments = PAYMENT_OPTIONS.filter((opt) => availableIds.includes(opt.id));
  const singlePayment = availablePayments.length === 1 ? availablePayments[0] : null;
  const SinglePaymentIcon = singlePayment?.icon;

  const belowMinimum =
    settings.minOrderAmount > 0 && subtotal < settings.minOrderAmount;

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  useEffect(() => {
    if (!loaded || availableIds.length === 0) return;
    if (!availableIds.includes(draft.paymentMethod)) {
      setPaymentMethod(availableIds[0]);
    }
  }, [loaded, availableIds, draft.paymentMethod, setPaymentMethod]);

  const handlePlace = async () => {
    if (
      !draft.deliveryMethod ||
      draft.cartLines.length === 0 ||
      belowMinimum ||
      !availableIds.includes(draft.paymentMethod)
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const drinkItems = Object.entries(draft.drinkQty)
        .filter(([, qty]) => qty > 0)
        .map(([id, quantity]) => ({ id, quantity }));

      const order = (await ordersApi.create({
        deliveryMethod: draft.deliveryMethod === "delivery" ? "DELIVERY" : "PICKUP",
        paymentMethod: draft.paymentMethod === "cash" ? "CASH" : "CARD",
        customer: {
          firstName: draft.customer.firstName,
          lastName: draft.customer.lastName,
          phone: draft.customer.phone,
          address: draft.customer.address,
          city: draft.deliveryMethod === "delivery" ? "Sombor" : draft.customer.city,
          note: draft.customer.note,
        },
        burgerConfigs: draft.cartLines.map((line) => ({
          burgerId: line.productId,
          ingredientIds: line.saladIds,
          extraIds: line.extraIds,
          sizeId: line.friesSize,
        })),
        drinkItems: drinkItems.length > 0 ? drinkItems : undefined,
      })) as { token: string; displayId: string; status: string; total: number };
      saveActiveOrder({
        token: order.token,
        displayId: order.displayId,
        status: order.status ?? "NEW",
        total: order.total,
        updatedAt: new Date().toISOString(),
      });
      resetDraft();
      router.push(`${orderTrackingPath(order.token)}?confirmed=1`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Greška pri slanju porudžbine";
      setError(mapOrderError(msg));
    } finally {
      setLoading(false);
    }
  };

  if (!settings.isOpen) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-black text-black">Restoran trenutno ne prima porudžbine</h2>
        <Button variant="secondary" className="mt-6" onClick={() => router.push("/")}>
          Nazad na početnu
        </Button>
      </div>
    );
  }

  if (!loaded) {
    return <div className="py-12 text-center text-gray-400">Učitavanje podešavanja...</div>;
  }

  return (
    <div className="w-full max-w-full space-y-8 overflow-hidden">
      <div className="w-full max-w-full overflow-hidden">
        <h2 className="text-2xl font-black uppercase text-black">Pregled porudžbine</h2>
        <p className="mt-2 text-gray-500">Proverite detalje, dodajte piće i završite</p>
      </div>

      <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-6">
        <h3 className="font-bold text-black">Stavke</h3>
        <div className="mt-3">
          <ReviewEditableCart />
        </div>
        {draft.cartLines.length === 0 && (
          <p className="mt-3 text-sm text-amber-700">
            Nema jela u korpi.{" "}
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => setStep(2)}
            >
              Dodajte stavke
            </button>
          </p>
        )}
        <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <span>Međuzbir</span>
            <span className="shrink-0 tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Dostava</span>
            <span className="shrink-0 tabular-nums">
              {formatDeliveryLine(
                draft.deliveryMethod,
                deliveryFee,
                subtotal,
                settings.freeDeliveryMin,
              )}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{vatLabel}</span>
            <span className="shrink-0 tabular-nums">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between gap-3 text-lg font-black">
            <span>UKUPNO</span>
            <span className="shrink-0 tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-black">Piće (opciono)</h3>
        <ul className="mt-3 space-y-2">
          {drinks.map((drink) => (
            <li
              key={drink.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              <div>
                <p className="font-semibold">{drink.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(drink.price)}</p>
              </div>
              <QuantityControl
                value={draft.drinkQty[drink.id] ?? 0}
                onChange={(q) => setDrinkQty(drink.id, q)}
              />
            </li>
          ))}
        </ul>
      </div>

      {belowMinimum && (
        <p className="text-sm text-amber-700">
          Minimalna porudžbina je {formatPrice(settings.minOrderAmount)}. Dodajte još stavki.
        </p>
      )}

      {availablePayments.length > 0 ? (
        <div className="w-full max-w-full overflow-hidden">
          <h3 className="font-bold text-black">Način plaćanja</h3>
          {singlePayment && SinglePaymentIcon ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-[#F6A300] bg-[#F6A300]/5 p-4">
              <SinglePaymentIcon className="h-5 w-5 shrink-0" />
              <span className="font-semibold">{singlePayment.label}</span>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {availablePayments.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={cn(
                    "flex min-w-0 items-center gap-3 rounded-xl border-2 p-4 text-left",
                    draft.paymentMethod === opt.id
                      ? "border-[#F6A300] bg-[#F6A300]/5"
                      : "border-gray-200",
                  )}
                >
                  <opt.icon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-red-600">Nijedan način plaćanja trenutno nije dostupan.</p>
      )}

      <OrderStepActions onBack={() => setStep(2)}>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          size="lg"
          onClick={handlePlace}
          disabled={loading || belowMinimum || availablePayments.length === 0 || draft.cartLines.length === 0}
          className="w-full sm:w-auto"
        >
          {loading ? "Šaljem..." : "ZAVRŠI PORUDŽBINU"}
        </Button>
      </OrderStepActions>
    </div>
  );
}
