"use client";

import Image from "next/image";
import { productsForCategory, MENU_CATEGORIES } from "@/lib/data/menu";
import { useMenuStore } from "@/store/menu-store";
import { useOrderStore } from "@/store/order-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { FRIES_SIZES } from "@/lib/types";
import type { MenuCategoryId, MenuItem } from "@/lib/types";
import { imageNeedsUnoptimized } from "@/lib/menu-image";

function productsInCategory(category: MenuCategoryId, storeProducts: MenuItem[]): MenuItem[] {
  const fromStore = storeProducts.filter((p) => p.menuCategory === category);
  if (fromStore.length > 0) return fromStore;
  return productsForCategory(category);
}

export function StepProducts() {
  const draft = useOrderStore((s) => s.draft);
  const prevStep = useOrderStore((s) => s.prevStep);
  const startEditingProduct = useOrderStore((s) => s.startEditingProduct);
  const products = useMenuStore((s) => s.products);

  const category = draft.activeCategory;
  if (!category) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">Niste izabrali kategoriju.</p>
        <Button variant="secondary" onClick={prevStep}>
          Nazad
        </Button>
      </div>
    );
  }

  const catMeta = MENU_CATEGORIES.find((c) => c.id === category);
  const list = productsInCategory(category, products);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase text-black">{catMeta?.name ?? "Proizvodi"}</h2>
        <p className="mt-2 text-gray-500">
          {category === "pomfrit"
            ? "Izaberite vrstu, zatim veličinu porcije"
            : "Odaberite proizvod, zatim dodajte sastojke"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => startEditingProduct(item.id, category)}
            className="flex gap-4 rounded-2xl border-2 border-gray-200 bg-white p-4 text-left transition hover:border-[#F6A300]"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized={imageNeedsUnoptimized(item.image)}
                  className="object-contain p-1"
                  sizes="96px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black uppercase text-black">{item.name}</p>
              {(item.composition?.length || item.description) && (
                <p className="mt-1 whitespace-pre-line text-xs text-gray-500">
                  {item.composition?.length
                    ? item.composition.join("\n")
                    : item.description}
                </p>
              )}
              <p className="mt-2 text-sm font-bold text-[#F6A300]">
                {item.menuCategory === "pomfrit"
                  ? `${formatPrice(FRIES_SIZES.mali.price)} / ${formatPrice(FRIES_SIZES.veliki.price)}`
                  : formatPrice(item.price)}
              </p>
              {item.menuCategory === "pomfrit" && (
                <p className="text-xs text-gray-400">Mali 100 g · Veliki 200 g</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="text-sm text-gray-400">Nema dostupnih proizvoda u ovoj kategoriji.</p>
      )}

      <Button variant="secondary" onClick={prevStep}>
        Nazad na kategorije
      </Button>
    </div>
  );
}
