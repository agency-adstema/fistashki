"use client";

import { create } from "zustand";
import { restaurantApi, type RestaurantSettingsFields } from "@/lib/api";
import { RESTAURANT } from "@/lib/data/menu";

export const DEFAULT_SHOP_SETTINGS: RestaurantSettingsFields = {
  phone: RESTAURANT.phone,
  email: RESTAURANT.email,
  address: RESTAURANT.address,
  city: "Sombor",
  workingHours: { display: RESTAURANT.hours },
  deliveryFee: 0,
  freeDeliveryMin: 0,
  minOrderAmount: 0,
  isOpen: true,
  cashEnabled: true,
  cardEnabled: true,
  deliveryEnabled: true,
  pickupEnabled: true,
  taxRate: RESTAURANT.taxRate,
  courierPayPerDelivery: 200,
  primaryColor: "#FFB800",
  secondaryColor: "#1A1A1A",
};

interface RestaurantStore {
  name: string;
  settings: RestaurantSettingsFields;
  loaded: boolean;
  loadRestaurant: () => Promise<void>;
}

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  name: RESTAURANT.name,
  settings: DEFAULT_SHOP_SETTINGS,
  loaded: false,

  loadRestaurant: async () => {
    try {
      const data = await restaurantApi.public();
      if (!data?.settings) {
        if (!get().loaded) set({ loaded: true });
        return;
      }
      set({
        name: data.name ?? RESTAURANT.name,
        settings: { ...DEFAULT_SHOP_SETTINGS, ...data.settings },
        loaded: true,
      });
    } catch (e) {
      console.error("Restaurant settings load failed, using fallback", e);
      if (!get().loaded) set({ loaded: true });
    }
  },
}));

export function useShopSettings() {
  return useRestaurantStore((s) => s.settings);
}
