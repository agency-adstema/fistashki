export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "cash" | "card";

export type MenuCategoryId = "burgers" | "sandwiches" | "lepinje" | "pomfrit";

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  /** Sastav / normativ — prikazuje se kupcima */
  composition?: string[];
  price: number;
  image: string;
  category: "burger" | "salad" | "extra" | "drink" | "side" | "sandwich" | "lepinja";
  /** Grupisanje u gridu poručivanja */
  menuCategory?: MenuCategoryId;
  available?: boolean;
  /** Za pomfrit — bez salate/dodataka */
  simple?: boolean;
}

export type FriesSizeId = "mali" | "veliki";

export const FRIES_SIZES: Record<
  FriesSizeId,
  { label: string; grams: number; price: number }
> = {
  mali: { label: "Mali", grams: 100, price: 250 },
  veliki: { label: "Veliki", grams: 200, price: 350 },
};

export const POMFRIT_EXTRA_ID = "ljuti-sos";

export interface CustomerDetails {
  firstName: string;
  lastName?: string;
  phone: string;
  address?: string;
  city?: string;
  note?: string;
}

/** Jedna stavka u korpi (proizvod + opcionalni dodaci) */
export interface CartLine {
  lineId: string;
  productId: string;
  menuCategory: MenuCategoryId;
  saladIds: string[];
  extraIds: string[];
  /** Veličina porcije pomfrita */
  friesSize?: FriesSizeId;
}

export interface OrderDraft {
  deliveryMethod: DeliveryMethod | null;
  customer: CustomerDetails;
  /** Aktivna kategorija na slajdu 2→3 */
  activeCategory: MenuCategoryId | null;
  /** Linija koja se trenutno podešava pre dodavanja u korpu */
  editingLine: CartLine | null;
  /** Korpa */
  cartLines: CartLine[];
  drinkQty: Record<string, number>;
  paymentMethod: PaymentMethod;
  /** @deprecated migracija */
  burgerQty?: Record<string, number>;
  /** @deprecated migracija */
  burgerLines?: Array<{
    lineId: string;
    burgerId: string;
    breadId: string | null;
    saladIds: string[];
    extraIds: string[];
  }>;
}

export interface PlacedOrder {
  token: string;
  createdAt: string;
  expiresAt: string;
  status: OrderStatus;
  estimatedMinutes: number | null;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  customer: CustomerDetails;
  items: { name: string; price: number }[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}
