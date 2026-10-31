"use client";

import { useEffect } from "react";
import { resolvePaymentMethod } from "@/lib/payment-methods";
import { useOrderStore } from "@/store/order-store";
import { useRestaurantStore } from "@/store/restaurant-store";

export function RestaurantBootstrap() {
  const loadRestaurant = useRestaurantStore((s) => s.loadRestaurant);
  const loaded = useRestaurantStore((s) => s.loaded);
  const settings = useRestaurantStore((s) => s.settings);
  const setPaymentMethod = useOrderStore((s) => s.setPaymentMethod);
  const paymentMethod = useOrderStore((s) => s.draft.paymentMethod);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  useEffect(() => {
    if (!loaded) return;
    const resolved = resolvePaymentMethod(settings, paymentMethod);
    if (resolved && resolved !== paymentMethod) {
      setPaymentMethod(resolved);
    }
  }, [loaded, settings, paymentMethod, setPaymentMethod]);

  return null;
}
