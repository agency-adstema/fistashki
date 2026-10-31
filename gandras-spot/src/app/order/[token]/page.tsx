import { Suspense } from "react";
import { OrderTracking } from "@/components/order/OrderTracking";

export default async function OrderTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center py-24 text-gray-400">Učitavanje...</main>
      }
    >
      <OrderTracking token={token} />
    </Suspense>
  );
}
