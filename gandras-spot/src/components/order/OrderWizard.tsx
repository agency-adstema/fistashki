"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { OrderStepper } from "@/components/order/OrderStepper";
import { OrderSummary } from "@/components/order/OrderSummary";
import { StepDelivery } from "@/components/order/steps/StepDelivery";
import { StepCategories } from "@/components/order/steps/StepCategories";
import { StepProducts } from "@/components/order/steps/StepProducts";
import { StepCustomizeProduct } from "@/components/order/steps/StepCustomizeProduct";
import { StepReview } from "@/components/order/steps/StepReview";
import { useOrderStore } from "@/store/order-store";
import { useRestaurantStore } from "@/store/restaurant-store";

export function OrderWizard() {
  const step = useOrderStore((s) => s.step);
  const loadRestaurant = useRestaurantStore((s) => s.loadRestaurant);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  /** Uvek na vrh stranice pri promeni koraka (Nastavi / Nazad / Završi). */
  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollTop();
    // Posle rendera novog koraka (layout / mobile browser quirks)
    const t = window.setTimeout(scrollTop, 0);
    return () => window.clearTimeout(t);
  }, [step]);

  /** Uvek osveži cenu dostave / podešavanja kad se vrati na tab (posle izmene u adminu). */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") loadRestaurant();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadRestaurant]);

  /** Draft živi ~15 min od aktivnosti; posle isteka / povratka kasnije — ispočetka. */
  useEffect(() => {
    const check = () => useOrderStore.getState().ensureFreshSession();
    check();
    const unsub = useOrderStore.persist.onFinishHydration(check);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);
    const tick = window.setInterval(check, 60_000);
    return () => {
      unsub();
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(tick);
    };
  }, []);

  let content = null;
  if (step === 1) content = <StepDelivery />;
  else if (step === 2) content = <StepCategories />;
  else if (step === 3) content = <StepProducts />;
  else if (step === 4) content = <StepCustomizeProduct />;
  else if (step === 5) content = <StepReview />;
  else content = <StepDelivery />;

  return (
    <div className="w-full min-w-0 max-w-[100dvw] overflow-x-clip">
      <Header />
      <OrderStepper current={step} />
      <div className="mx-auto box-border w-full min-w-0 max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid min-w-0 gap-8 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">{content}</div>
          <div className="hidden min-w-0 lg:block">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
