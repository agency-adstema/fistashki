import type { RestaurantSettingsFields } from "@/lib/api";
import type { PaymentMethod } from "@/lib/types";

export function getAvailablePaymentMethods(
  settings: Pick<RestaurantSettingsFields, "cashEnabled" | "cardEnabled">,
): PaymentMethod[] {
  const methods: PaymentMethod[] = [];
  if (settings.cashEnabled) methods.push("cash");
  if (settings.cardEnabled) methods.push("card");
  return methods;
}

export function resolvePaymentMethod(
  settings: Pick<RestaurantSettingsFields, "cashEnabled" | "cardEnabled">,
  current: PaymentMethod,
): PaymentMethod | null {
  const available = getAvailablePaymentMethods(settings);
  if (available.length === 0) return null;
  if (available.includes(current)) return current;
  return available[0];
}
