"use client";

import Image from "next/image";
import { useMenuStore } from "@/store/menu-store";
import { PRODUCTS, getRecommendedSaladId, getFriesLinePrice, formatFriesSizeLabel, extrasForCategory } from "@/lib/data/menu";
import {
  useOrderStore,
  calcTotals,
} from "@/store/order-store";
import { useShopSettings } from "@/store/restaurant-store";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { FRIES_SIZES, type FriesSizeId } from "@/lib/types";
import { BurgerComposition, getBurgerComposition } from "@/components/menu/BurgerComposition";
import { imageNeedsUnoptimized } from "@/lib/menu-image";

export function StepCustomizeProduct() {
  const draft = useOrderStore((s) => s.draft);
  const prevStep = useOrderStore((s) => s.prevStep);
  const toggleEditingSalad = useOrderStore((s) => s.toggleEditingSalad);
  const toggleEditingExtra = useOrderStore((s) => s.toggleEditingExtra);
  const setEditingFriesSize = useOrderStore((s) => s.setEditingFriesSize);
  const addEditingToCartAndContinue = useOrderStore((s) => s.addEditingToCartAndContinue);
  const addEditingToCartAndCheckout = useOrderStore((s) => s.addEditingToCartAndCheckout);
  const salads = useMenuStore((s) => s.salads);
  const extras = useMenuStore((s) => s.extras);
  const products = useMenuStore((s) => s.products);
  const settings = useShopSettings();

  const line = draft.editingLine;
  if (!line) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">Niste izabrali proizvod.</p>
        <Button variant="secondary" onClick={prevStep}>
          Nazad
        </Button>
      </div>
    );
  }

  const product =
    products.find((p) => p.id === line.productId) ??
    PRODUCTS.find((p) => p.id === line.productId);

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">Proizvod nije pronađen.</p>
        <Button variant="secondary" onClick={prevStep}>
          Nazad
        </Button>
      </div>
    );
  }

  const simple = Boolean(product.simple);
  const isBurger = line.menuCategory === "burgers";
  const isSandwich = line.menuCategory === "sandwiches";
  const isPomfrit = line.menuCategory === "pomfrit";
  const showBurgerCustomize = isBurger && !simple;
  const showSandwichCustomize = isSandwich;
  const showPomfritCustomize = isPomfrit;
  const recommendedSaladId = getRecommendedSaladId(line.productId);
  const friesSize = line.friesSize ?? "mali";
  const sandwichExtras = extrasForCategory("sandwiches", extras);
  const burgerExtras = extrasForCategory("burgers", extras);
  const pomfritExtras = extrasForCategory("pomfrit", extras).all;
  const displayPrice = isPomfrit ? getFriesLinePrice(friesSize) : product.price;
  const previewDraft = {
    ...draft,
    cartLines: [...draft.cartLines, line],
  };
  const { total } = calcTotals(previewDraft, settings);

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-50">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized={imageNeedsUnoptimized(product.image)}
              className="object-contain p-2"
              sizes="112px"
            />
          ) : null}
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase text-black">{product.name}</h2>
          <p className="mt-1 text-lg font-bold text-[#F6A300]">{formatPrice(displayPrice)}</p>
        </div>
      </div>

      {getBurgerComposition(product).length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase text-gray-400">Normativ / sastav</p>
          <BurgerComposition burger={product} hideHeading className="mt-2" />
        </div>
      )}

      {showBurgerCustomize && (
        <>
          <div>
            <h3 className="font-bold text-black">Salate</h3>
            <p className="mt-1 text-xs text-gray-400">Besplatno — izaberite šta želite</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {salads.map((s) => {
                const on = line.saladIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleEditingSalad(s.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      on
                        ? "border-[#F6A300] bg-[#F6A300] text-black"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    {s.name}
                    {recommendedSaladId === s.id ? " (preporučeno)" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black">Dodaci</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {burgerExtras.all.map((e) => {
                const on = line.extraIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEditingExtra(e.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      on
                        ? "border-[#F6A300] bg-[#F6A300] text-black"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    {e.name} · {formatPrice(e.price)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showSandwichCustomize && (
        <>
          <div>
            <h3 className="font-bold text-black">Salate</h3>
            <p className="mt-1 text-xs text-gray-400">Besplatno — izaberite šta želite</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {salads.map((s) => {
                const on = line.saladIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleEditingSalad(s.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      on
                        ? "border-[#F6A300] bg-[#F6A300] text-black"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black">Mesni dodaci</h3>
            <p className="mt-1 text-xs text-gray-400">Po 50 g</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sandwichExtras.meat.map((e) => {
                const on = line.extraIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEditingExtra(e.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      on
                        ? "border-[#F6A300] bg-[#F6A300] text-black"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    {e.name} · {formatPrice(e.price)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black">Sosevi</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {sandwichExtras.sauces.map((e) => {
                const on = line.extraIds.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggleEditingExtra(e.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      on
                        ? "border-[#F6A300] bg-[#F6A300] text-black"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    {e.name} · {formatPrice(e.price)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      {showPomfritCustomize && (
        <>
          <div>
            <h3 className="font-bold text-black">Veličina</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(FRIES_SIZES) as FriesSizeId[]).map((sizeId) => {
                const size = FRIES_SIZES[sizeId];
                const on = friesSize === sizeId;
                return (
                  <button
                    key={sizeId}
                    type="button"
                    onClick={() => setEditingFriesSize(sizeId)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      on
                        ? "border-[#F6A300] bg-[#F6A300] text-black"
                        : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    {formatFriesSizeLabel(sizeId)} · {formatPrice(size.price)}
                  </button>
                );
              })}
            </div>
          </div>

          {pomfritExtras.length > 0 && (
            <div>
              <h3 className="font-bold text-black">Dodatak</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {pomfritExtras.map((e) => {
                  const on = line.extraIds.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => toggleEditingExtra(e.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        on
                          ? "border-[#F6A300] bg-[#F6A300] text-black"
                          : "border-gray-200 bg-white text-gray-600",
                      )}
                    >
                      {e.name} · {formatPrice(e.price)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={prevStep}>
          Nazad
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={addEditingToCartAndContinue}>
            Nastavi porudžbinu
          </Button>
          <Button
            className="bg-[#F6A300] text-black hover:bg-[#e09900]"
            onClick={addEditingToCartAndCheckout}
          >
            Završi · idi na plaćanje
          </Button>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 sm:text-right">
        Sa ovom stavkom: {formatPrice(total)}
      </p>
    </div>
  );
}
