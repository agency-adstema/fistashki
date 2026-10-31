"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, Store } from "lucide-react";
import { useOrderStore } from "@/store/order-store";
import { useRestaurantStore, useShopSettings } from "@/store/restaurant-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatPrice } from "@/lib/utils";
import type { DeliveryMethod } from "@/lib/types";

const DELIVERY_CITY = "Sombor";

const DELIVERY_OPTIONS = [
  { id: "delivery" as DeliveryMethod, icon: Truck, label: "Dostava", desc: "Na vašu adresu" },
  { id: "pickup" as DeliveryMethod, icon: Store, label: "Lično preuzimanje", desc: "Preuzmite u lokalu" },
] as const;

export function StepDelivery() {
  const router = useRouter();
  const settings = useShopSettings();
  const loaded = useRestaurantStore((s) => s.loaded);
  const { draft, setDeliveryMethod, setCustomer, setStep } = useOrderStore();
  const method = draft.deliveryMethod;

  const availableOptions = DELIVERY_OPTIONS.filter((opt) =>
    opt.id === "delivery" ? settings.deliveryEnabled : settings.pickupEnabled,
  );

  useEffect(() => {
    if (availableOptions.length === 1 && method !== availableOptions[0].id) {
      setDeliveryMethod(availableOptions[0].id);
      return;
    }
    if (method === "delivery" && !settings.deliveryEnabled && settings.pickupEnabled) {
      setDeliveryMethod("pickup");
    }
    if (method === "pickup" && !settings.pickupEnabled && settings.deliveryEnabled) {
      setDeliveryMethod("delivery");
    }
  }, [
    method,
    availableOptions,
    settings.deliveryEnabled,
    settings.pickupEnabled,
    setDeliveryMethod,
  ]);

  useEffect(() => {
    if (method === "delivery" && draft.customer.city !== DELIVERY_CITY) {
      setCustomer({ city: DELIVERY_CITY });
    }
  }, [method, draft.customer.city, setCustomer]);

  const canContinue =
    method === "pickup"
      ? Boolean(draft.customer.firstName && draft.customer.phone)
      : Boolean(
          draft.customer.firstName &&
            draft.customer.lastName &&
            draft.customer.phone &&
            draft.customer.address,
        );

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

  if (availableOptions.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-black text-black">Poručivanje trenutno nije dostupno</h2>
        <Button variant="secondary" className="mt-6" onClick={() => router.push("/")}>
          Nazad na početnu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase text-black">Naruči</h2>
        <p className="mt-2 text-gray-500">Izaberite dostavu ili lično preuzimanje</p>
      </div>

      <div className={cn("grid gap-4", availableOptions.length > 1 && "sm:grid-cols-2")}>
        {availableOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setDeliveryMethod(opt.id)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all",
              method === opt.id
                ? "border-[#F6A300] bg-[#F6A300]/5"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                method === opt.id ? "bg-[#F6A300]" : "bg-gray-100",
              )}
            >
              <opt.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-black">{opt.label}</p>
              <p className="text-sm text-gray-500">{opt.desc}</p>
              {opt.id === "delivery" && settings.deliveryEnabled && (
                <p className="mt-1 text-xs font-semibold text-gray-600">
                  Cena dostave:{" "}
                  {loaded ? formatPrice(settings.deliveryFee) : "…"}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {method && (
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <h3 className="font-bold text-black">Vaši podaci</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Ime *"
              value={draft.customer.firstName}
              onChange={(e) => setCustomer({ firstName: e.target.value })}
            />
            {method === "delivery" && (
              <Input
                placeholder="Prezime *"
                value={draft.customer.lastName}
                onChange={(e) => setCustomer({ lastName: e.target.value })}
              />
            )}
            <Input
              placeholder="Telefon *"
              type="tel"
              value={draft.customer.phone}
              onChange={(e) => setCustomer({ phone: e.target.value })}
            />
            {method === "delivery" && (
              <>
                <Input
                  placeholder="Adresa *"
                  value={draft.customer.address}
                  onChange={(e) => setCustomer({ address: e.target.value })}
                  className="sm:col-span-2"
                />
                <Input
                  placeholder="Grad *"
                  value={DELIVERY_CITY}
                  readOnly
                  aria-readonly="true"
                  className="cursor-default bg-gray-100 text-gray-700"
                  tabIndex={-1}
                />
              </>
            )}
            <Input
              placeholder="Napomena (opciono)"
              value={draft.customer.note}
              onChange={(e) => setCustomer({ note: e.target.value })}
              className="sm:col-span-2"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => router.push("/")}>
          Nazad
        </Button>
        <Button onClick={() => setStep(2)} disabled={!canContinue || !method}>
          Nastavi na meni
        </Button>
      </div>
    </div>
  );
}
