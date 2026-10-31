import { isActiveOrderStatus } from "@/lib/order-status";
import { toTelHref } from "@/lib/phone";

const STORAGE_KEY = "gandras_active_order";
/** Broj za porudžbine — dugme „Pozovi i dodaj još“. */
const ORDERS_PHONE = "0600776912";

export interface StoredActiveOrder {
  token: string;
  displayId: string;
  status: string;
  total?: number;
  updatedAt: string;
}

export function saveActiveOrder(order: StoredActiveOrder) {
  if (typeof window === "undefined") return;
  if (!order.token || isDisplayRef(order.token)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  window.dispatchEvent(new CustomEvent("gandras:active-order"));
}

export function getActiveOrder(): StoredActiveOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredActiveOrder;
    if (!parsed.token || !parsed.displayId) return null;
    if (isDisplayRef(parsed.token)) return null;
    if (!isActiveOrderStatus(parsed.status)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function updateActiveOrder(patch: Partial<StoredActiveOrder>) {
  const current = getActiveOrder();
  if (!current) return;
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  if (!isActiveOrderStatus(next.status)) {
    clearActiveOrder();
    return;
  }
  saveActiveOrder(next);
}

export function clearActiveOrder() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("gandras:active-order"));
}

export function isDisplayRef(value: string): boolean {
  return /^\d{2}-\d{3}$/.test(value);
}

export function orderTrackingPath(token: string): string {
  return `/order/${encodeURIComponent(token)}`;
}

/** Čist tel: link (bez ?body= — to na telefonu kvari broj / dodaje cifre). */
export function buildAddToOrderPhoneUrl(_displayId?: string, phone?: string): string {
  return toTelHref(phone || ORDERS_PHONE) ?? `tel:${ORDERS_PHONE}`;
}
