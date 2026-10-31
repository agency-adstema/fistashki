"use client";

import Image from "next/image";
import { MENU_CATEGORIES } from "@/lib/data/menu";
import { useOrderStore, calcTotals } from "@/store/order-store";
import { useShopSettings } from "@/store/restaurant-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function StepCategories() {
  const { draft, selectCategory, prevStep, setStep } = useOrderStore();
  const settings = useShopSettings();
  const { total, burgerCount } = calcTotals(draft, settings);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase text-black">Izaberite kategoriju</h2>
        <p className="mt-2 text-gray-500">Burgeri, sendviči, kompleks lepinje ili pomfrit — dodajte proizvod po proizvod</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MENU_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => selectCategory(cat.id)}
            className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white text-left transition hover:border-[#F6A300]"
          >
            <div className="relative aspect-[4/3] bg-gray-50">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-contain p-4 transition group-hover:scale-[1.03]"
                sizes="320px"
              />
            </div>
            <div className="border-t border-gray-100 p-4">
              <p className="text-lg font-black uppercase text-black">{cat.name}</p>
              <p className="mt-1 text-sm text-gray-500">{cat.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={prevStep}>
          Nazad
        </Button>
        <div className="flex items-center gap-3">
          {burgerCount > 0 && (
            <p className="text-sm text-gray-600">
              U korpi: <strong>{burgerCount}</strong> · {formatPrice(total)}
            </p>
          )}
          <Button
            onClick={() => setStep(5)}
            disabled={burgerCount === 0}
            className="bg-[#F6A300] text-black hover:bg-[#e09900]"
          >
            Idi na plaćanje
          </Button>
        </div>
      </div>
    </div>
  );
}
