"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RestaurantSettingsFields } from "@/lib/api";
import { calcOrderAmounts } from "@/lib/order-pricing";
import { PRODUCTS, getFriesLinePrice, formatFriesSizeLabel, isExtraAllowedForCategory } from "@/lib/data/menu";
import { useMenuStore } from "@/store/menu-store";
import { useRestaurantStore } from "@/store/restaurant-store";
import { generateOrderToken } from "@/lib/utils";
import type {
  CartLine,
  CustomerDetails,
  DeliveryMethod,
  FriesSizeId,
  MenuCategoryId,
  OrderDraft,
  PaymentMethod,
  PlacedOrder,
} from "@/lib/types";

const emptyCustomer: CustomerDetails = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  note: "",
};

const initialDraft: OrderDraft = {
  deliveryMethod: null,
  customer: emptyCustomer,
  activeCategory: null,
  editingLine: null,
  cartLines: [],
  drinkQty: {},
  paymentMethod: "cash",
};

/** Nezavršena narudžbina važi ovoliko od poslednje aktivnosti; posle toga se briše. */
export const ORDER_DRAFT_TTL_MS = 15 * 60 * 1000;

function withActivity<T extends Record<string, unknown>>(patch: T): T & { sessionActiveAt: number } {
  return { ...patch, sessionActiveAt: Date.now() };
}

function hasUnfinishedOrder(draft: OrderDraft, step: number): boolean {
  if (step !== 1) return true;
  if (draft.deliveryMethod) return true;
  if (draft.editingLine) return true;
  if (draft.cartLines.length > 0) return true;
  if (Object.keys(draft.drinkQty).length > 0) return true;
  const c = draft.customer;
  return Boolean(c.firstName || c.lastName || c.phone || c.address || c.city || c.note);
}

function newLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function setQtyInMap(map: Record<string, number>, id: string, quantity: number) {
  const next = { ...map };
  if (quantity <= 0) delete next[id];
  else next[id] = quantity;
  return next;
}

function findProduct(productId: string) {
  const { products } = useMenuStore.getState();
  return products.find((p) => p.id === productId) ?? PRODUCTS.find((p) => p.id === productId);
}

function sanitizeCartLine(line: CartLine): CartLine {
  if (line.menuCategory === "pomfrit") {
    return {
      ...line,
      saladIds: [],
      extraIds: line.extraIds.filter((id) => isExtraAllowedForCategory("pomfrit", id)),
      friesSize: line.friesSize ?? "mali",
    };
  }
  if (line.menuCategory === "sandwiches") {
    return {
      ...line,
      extraIds: line.extraIds.filter((id) => isExtraAllowedForCategory("sandwiches", id)),
    };
  }
  if (line.menuCategory === "burgers") {
    return {
      ...line,
      extraIds: line.extraIds.filter((id) => isExtraAllowedForCategory("burgers", id)),
    };
  }
  return line;
}

interface OrderStore {
  draft: OrderDraft;
  step: number;
  /** Timestamp poslednje aktivnosti na draftu (za TTL sesije). */
  sessionActiveAt: number;
  placedOrders: PlacedOrder[];
  /** Ako je draft istekao — resetuje na početak. Vraća true ako sesija još važi. */
  ensureFreshSession: () => boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  selectCategory: (category: MenuCategoryId) => void;
  startEditingProduct: (productId: string, category: MenuCategoryId) => void;
  toggleEditingSalad: (saladId: string) => void;
  toggleEditingExtra: (extraId: string) => void;
  setEditingFriesSize: (size: FriesSizeId) => void;
  /** Dodaj u korpu i vrati na kategorije */
  addEditingToCartAndContinue: () => void;
  /** Dodaj u korpu i idi na pregled */
  addEditingToCartAndCheckout: () => void;
  removeCartLine: (lineId: string) => void;
  setDrinkQty: (id: string, quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  resetDraft: () => void;
  placeOrder: () => PlacedOrder;
  updateOrderStatus: (token: string, status: PlacedOrder["status"], minutes?: number) => void;
  getOrder: (token: string) => PlacedOrder | undefined;
}

/** Uključi stavku koja se trenutno podešava (sidebar / preview). */
export function draftForTotals(draft: OrderDraft): OrderDraft {
  if (!draft.editingLine) return draft;
  return { ...draft, cartLines: [...draft.cartLines, draft.editingLine] };
}

function calcTotals(
  draft: OrderDraft,
  settings?: Pick<RestaurantSettingsFields, "deliveryFee" | "freeDeliveryMin" | "taxRate">,
) {
  const { salads, extras, drinks } = useMenuStore.getState();
  const items: { name: string; price: number; kind?: string; quantity?: number }[] = [];

  draft.cartLines.forEach((line, index) => {
    const product = findProduct(line.productId);
    const label = draft.cartLines.length > 1 ? `Stavka ${index + 1}` : "Stavka";
    const baseName = product?.name ?? "Proizvod";
    const name =
      line.menuCategory === "pomfrit" && line.friesSize
        ? `${baseName} — ${formatFriesSizeLabel(line.friesSize)}`
        : baseName;

    if (product) {
      const price =
        line.menuCategory === "pomfrit" && line.friesSize
          ? getFriesLinePrice(line.friesSize)
          : product.price;
      items.push({
        name: `${label} · ${name}`,
        price,
        kind: line.menuCategory === "pomfrit" || product.simple ? "side" : "burger",
      });
    }

    line.saladIds.forEach((id) => {
      const s = salads.find((x) => x.id === id);
      if (s) items.push({ name: `${label} · ${s.name}`, price: s.price, kind: "ingredient" });
    });

    line.extraIds.forEach((id) => {
      const e = extras.find((x) => x.id === id);
      if (e) items.push({ name: `${label} · ${e.name}`, price: e.price, kind: "extra" });
    });
  });

  for (const drink of drinks) {
    const qty = draft.drinkQty[drink.id] ?? 0;
    if (qty > 0) {
      items.push({
        name: qty > 1 ? `${qty}× ${drink.name}` : drink.name,
        price: drink.price * qty,
        kind: "drink",
        quantity: qty,
      });
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const shopSettings = settings ?? useRestaurantStore.getState().settings;
  const { deliveryFee, tax, total } = calcOrderAmounts(subtotal, draft.deliveryMethod, shopSettings);

  return { items, subtotal, deliveryFee, tax, total, burgerCount: draft.cartLines.length };
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      draft: initialDraft,
      step: 1,
      sessionActiveAt: 0,
      placedOrders: [],

      ensureFreshSession: () => {
        const { sessionActiveAt, draft, step } = get();
        const expired =
          !sessionActiveAt || Date.now() - sessionActiveAt > ORDER_DRAFT_TTL_MS;
        if (!expired) return true;
        if (hasUnfinishedOrder(draft, step) || sessionActiveAt > 0) {
          set({ draft: initialDraft, step: 1, sessionActiveAt: 0 });
        }
        return false;
      },

      setStep: (step) => set(withActivity({ step })),

      nextStep: () => set((s) => withActivity({ step: Math.min(s.step + 1, 5) })),

      prevStep: () => {
        const { step, draft } = get();
        if (step === 4) {
          set(withActivity({ step: 3, draft: { ...draft, editingLine: null } }));
          return;
        }
        if (step === 3) {
          set(
            withActivity({
              step: 2,
              draft: { ...draft, activeCategory: null, editingLine: null },
            }),
          );
          return;
        }
        set(withActivity({ step: Math.max(step - 1, 1) }));
      },

      setDeliveryMethod: (method) =>
        set((s) => withActivity({ draft: { ...s.draft, deliveryMethod: method } })),

      setCustomer: (customer) =>
        set((s) =>
          withActivity({
            draft: { ...s.draft, customer: { ...s.draft.customer, ...customer } },
          }),
        ),

      selectCategory: (category) =>
        set((s) =>
          withActivity({
            step: 3,
            draft: { ...s.draft, activeCategory: category, editingLine: null },
          }),
        ),

      startEditingProduct: (productId, category) => {
        set((s) =>
          withActivity({
            step: 4,
            draft: {
              ...s.draft,
              activeCategory: category,
              editingLine: {
                lineId: newLineId(),
                productId,
                menuCategory: category,
                saladIds: [],
                extraIds: [],
                friesSize: category === "pomfrit" ? ("mali" as FriesSizeId) : undefined,
              },
            },
          }),
        );
      },

      toggleEditingSalad: (saladId) =>
        set((s) => {
          const line = s.draft.editingLine;
          if (!line) return s;
          const saladIds = line.saladIds.includes(saladId)
            ? line.saladIds.filter((x) => x !== saladId)
            : [...line.saladIds, saladId];
          return withActivity({ draft: { ...s.draft, editingLine: { ...line, saladIds } } });
        }),

      toggleEditingExtra: (extraId) =>
        set((s) => {
          const line = s.draft.editingLine;
          if (!line) return s;
          if (!isExtraAllowedForCategory(line.menuCategory, extraId)) return s;
          const extraIds = line.extraIds.includes(extraId)
            ? line.extraIds.filter((x) => x !== extraId)
            : [...line.extraIds, extraId];
          return withActivity({ draft: { ...s.draft, editingLine: { ...line, extraIds } } });
        }),

      setEditingFriesSize: (size) =>
        set((s) => {
          const line = s.draft.editingLine;
          if (!line || line.menuCategory !== "pomfrit") return s;
          return withActivity({ draft: { ...s.draft, editingLine: { ...line, friesSize: size } } });
        }),

      addEditingToCartAndContinue: () => {
        const { draft } = get();
        if (!draft.editingLine) return;
        const line = sanitizeCartLine(draft.editingLine);
        set(
          withActivity({
            step: 2,
            draft: {
              ...draft,
              cartLines: [...draft.cartLines, line],
              editingLine: null,
              activeCategory: null,
            },
          }),
        );
      },

      addEditingToCartAndCheckout: () => {
        const { draft } = get();
        if (!draft.editingLine) return;
        const line = sanitizeCartLine(draft.editingLine);
        set(
          withActivity({
            step: 5,
            draft: {
              ...draft,
              cartLines: [...draft.cartLines, line],
              editingLine: null,
            },
          }),
        );
      },

      removeCartLine: (lineId) =>
        set((s) =>
          withActivity({
            draft: {
              ...s.draft,
              cartLines: s.draft.cartLines.filter((l) => l.lineId !== lineId),
            },
          }),
        ),

      setDrinkQty: (id, quantity) =>
        set((s) =>
          withActivity({
            draft: { ...s.draft, drinkQty: setQtyInMap(s.draft.drinkQty, id, quantity) },
          }),
        ),

      setPaymentMethod: (method) =>
        set((s) => withActivity({ draft: { ...s.draft, paymentMethod: method } })),

      resetDraft: () => set({ draft: initialDraft, step: 1, sessionActiveAt: 0 }),

      placeOrder: () => {
        const { draft } = get();
        const { items, subtotal, deliveryFee, tax, total } = calcTotals(draft);
        const created = new Date();
        const order: PlacedOrder = {
          token: generateOrderToken(),
          createdAt: created.toISOString(),
          expiresAt: new Date(created.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: "new",
          estimatedMinutes: null,
          deliveryMethod: draft.deliveryMethod!,
          paymentMethod: draft.paymentMethod,
          customer: { ...draft.customer },
          items,
          subtotal,
          deliveryFee,
          tax,
          total,
        };
        set((s) => ({
          placedOrders: [order, ...s.placedOrders],
          draft: initialDraft,
          step: 1,
          sessionActiveAt: 0,
        }));
        return order;
      },

      updateOrderStatus: (token, status, minutes) =>
        set((s) => ({
          placedOrders: s.placedOrders.map((o) =>
            o.token === token
              ? { ...o, status, estimatedMinutes: minutes ?? o.estimatedMinutes }
              : o,
          ),
        })),

      getOrder: (token) => get().placedOrders.find((o) => o.token === token),
    }),
    {
      name: "gandras-orders",
      version: 5,
      partialize: (s) => ({
        draft: s.draft,
        step: s.step,
        sessionActiveAt: s.sessionActiveAt,
        placedOrders: s.placedOrders,
      }),
      migrate: (persisted, fromVersion) => {
        const state = persisted as {
          draft?: Record<string, unknown>;
          step?: number;
          sessionActiveAt?: number;
        };

        if (state.draft) {
          const d = state.draft;
          if (!Array.isArray(d.cartLines)) {
            const legacyLines = Array.isArray(d.burgerLines)
              ? (d.burgerLines as Array<{
                  lineId: string;
                  burgerId: string;
                  saladIds?: string[];
                  extraIds?: string[];
                }>)
              : [];
            d.cartLines = legacyLines.map((l) => ({
              lineId: l.lineId,
              productId: l.burgerId,
              menuCategory: "burgers" as MenuCategoryId,
              saladIds: (l.saladIds ?? []).filter(Boolean),
              extraIds: (l.extraIds ?? []).filter((id) => id !== "pomfrit"),
            }));
          }
          d.activeCategory = (d.activeCategory as MenuCategoryId) ?? null;
          d.editingLine = (d.editingLine as CartLine) ?? null;
          if (!d.drinkQty) d.drinkQty = {};
          delete d.burgerQty;
          delete d.burgerLines;
          delete d.breadId;
        }

        // Stare beskonačne korpe: jednokratno počisti pri uvođenju TTL-a.
        if (fromVersion < 5) {
          state.draft = { ...initialDraft };
          state.step = 1;
          state.sessionActiveAt = 0;
        } else if (
          state.sessionActiveAt &&
          Date.now() - state.sessionActiveAt > ORDER_DRAFT_TTL_MS
        ) {
          state.draft = { ...initialDraft };
          state.step = 1;
          state.sessionActiveAt = 0;
        }

        return persisted as OrderStore;
      },
      onRehydrateStorage: () => (state) => {
        state?.ensureFreshSession();
      },
    },
  ),
);

export { calcTotals };
