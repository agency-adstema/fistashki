"use client";

import { create } from "zustand";
import { menuApi } from "@/lib/api";
import {
  BURGERS,
  DRINKS,
  EXTRAS,
  FRIES,
  LEPINJE,
  PRODUCTS,
  SALADS,
  SANDWICHES,
} from "@/lib/data/menu";
import { mapPublicMenu } from "@/lib/map-public-menu";
import type { MenuItem } from "@/lib/types";

interface MenuStore {
  products: MenuItem[];
  burgers: MenuItem[];
  sandwiches: MenuItem[];
  lepinje: MenuItem[];
  fries: MenuItem[];
  salads: MenuItem[];
  extras: MenuItem[];
  drinks: MenuItem[];
  loaded: boolean;
  loadMenu: () => Promise<void>;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  products: PRODUCTS,
  burgers: BURGERS,
  sandwiches: SANDWICHES,
  lepinje: LEPINJE,
  fries: FRIES,
  salads: SALADS,
  extras: EXTRAS,
  drinks: DRINKS,
  loaded: false,

  loadMenu: async () => {
    try {
      const data = await menuApi.public();
      const mapped = mapPublicMenu(data);
      set({ ...mapped, loaded: true });
    } catch (e) {
      console.error("Menu load failed, using fallback", e);
      if (!get().loaded) set({ loaded: true });
    }
  },
}));
