import type { Metadata } from "next";
import { OrderWizard } from "@/components/order/OrderWizard";

export const metadata: Metadata = {
  title: "Poruči online",
};

export default function OrderPage() {
  return <OrderWizard />;
}
