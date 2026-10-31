import type { RestaurantSettingsFields } from "@/lib/api";
import type { DeliveryMethod } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function calcDeliveryFee(
  settings: Pick<RestaurantSettingsFields, "deliveryFee" | "freeDeliveryMin">,
  deliveryMethod: DeliveryMethod | null,
  subtotal: number,
): number {
  if (deliveryMethod !== "delivery") return 0;
  if (settings.freeDeliveryMin > 0 && subtotal >= settings.freeDeliveryMin) return 0;
  return settings.deliveryFee;
}

/** Cene u meniju su bruto (PDV uključen). Vraća informativni iznos PDV-a iz bruto sume. */
export function vatFromGross(grossAmount: number, taxRate: number): number {
  if (taxRate <= 0 || grossAmount <= 0) return 0;
  return Math.round((grossAmount * taxRate) / (1 + taxRate));
}

/** @deprecated Koristi vatFromGross — meni je bruto, PDV se ne dodaje na ukupno. */
export function calcTax(taxableAmount: number, taxRate: number): number {
  return vatFromGross(taxableAmount, taxRate);
}

export function calcOrderAmounts(
  subtotal: number,
  deliveryMethod: DeliveryMethod | null,
  settings: Pick<RestaurantSettingsFields, "deliveryFee" | "freeDeliveryMin" | "taxRate">,
  discount = 0,
) {
  const deliveryFee = calcDeliveryFee(settings, deliveryMethod, subtotal);
  const gross = Math.max(0, subtotal - discount) + deliveryFee;
  const tax = vatFromGross(gross, settings.taxRate);
  const total = gross;
  return { deliveryFee, tax, total };
}

export function formatDeliveryLine(
  deliveryMethod: DeliveryMethod | null,
  deliveryFee: number,
  subtotal: number,
  freeDeliveryMin: number,
): string {
  if (deliveryMethod !== "delivery") return "—";
  if (deliveryFee === 0 && freeDeliveryMin > 0 && subtotal >= freeDeliveryMin) {
    return "Besplatno";
  }
  return formatPrice(deliveryFee);
}

export function mapOrderError(message: string): string {
  const map: Record<string, string> = {
    "Restaurant is closed": "Restoran trenutno ne prima porudžbine.",
    "Delivery not available": "Dostava trenutno nije dostupna.",
    "Pickup not available": "Preuzimanje u lokalu trenutno nije dostupno.",
    "Cash payment not available": "Plaćanje gotovinom trenutno nije dostupno.",
    "Card payment not available": "Plaćanje karticom trenutno nije dostupno.",
    "Minimum order amount not met": "Iznos porudžbine je ispod minimuma.",
  };
  return map[message] ?? message;
}
