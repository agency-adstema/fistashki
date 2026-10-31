"use client";

import { useEffect, useState, useCallback } from "react";
import { kitchenApi, ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CountdownBadge } from "@/components/kitchen/CountdownBadge";
import { getOrdersSocket } from "@/lib/socket";
import { orderStatusLabel } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import { OrderItemsList } from "@/components/order/OrderItemsList";

interface KitchenOrder {
  id: string;
  displayId: string;
  status: string;
  estimatedReadyAt: string | null;
  customerNote?: string;
  deliveryMethod: string;
  items: Array<{ name: string; quantity: number; totalPrice?: number; kind?: string | null; options?: Record<string, unknown> | null }>;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    kitchenApi.orders().then((data) => setOrders(data as KitchenOrder[]));
  }, []);

  useEffect(() => {
    load();
    const token = localStorage.getItem("gandras_token");
    if (!token) return;

    const socket = getOrdersSocket(token);
    socket.on("order:new", load);
    socket.on("order:updated", load);
    return () => {
      socket.off("order:new", load);
      socket.off("order:updated", load);
    };
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      await ordersApi.updateStatus(id, status);
      load();
      window.dispatchEvent(new CustomEvent("gandras:orders-changed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-black text-[#FFB800]">KITCHEN MODE</h1>
      <p className="text-gray-400">{orders.length} aktivnih porudžbina</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => {
          const inPrep = order.status === "IN_PREPARATION";
          return (
            <div key={order.id} className="rounded-3xl border-2 border-gray-800 bg-gray-900 p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-4xl font-black text-[#FFB800]">{order.displayId}</span>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {order.deliveryMethod === "DELIVERY" ? "Dostava" : "Preuzimanje"} ·{" "}
                    {orderStatusLabel(order.status)}
                  </p>
                </div>
                <CountdownBadge readyAt={order.estimatedReadyAt} />
              </div>

              <div className="mt-6">
                <OrderItemsList
                  compact
                  items={order.items.map((item) => ({
                    name: item.name,
                    totalPrice: item.totalPrice ?? 0,
                    quantity: item.quantity,
                    kind: item.kind,
                    options: item.options,
                  }))}
                />
              </div>

              {order.customerNote && (
                <p className="mt-4 rounded-xl bg-yellow-900/30 p-3 text-yellow-300">
                  ⚠️ {order.customerNote}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  className={cn("flex-1 bg-[#FFB800] text-black", inPrep && "opacity-50")}
                  disabled={inPrep || busyId === order.id}
                  onClick={() => setStatus(order.id, "IN_PREPARATION")}
                >
                  U pripremi
                </Button>
                <Button
                  className="flex-1"
                  variant="secondary"
                  disabled={busyId === order.id}
                  onClick={() => setStatus(order.id, "READY")}
                >
                  Gotovo
                </Button>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="col-span-full py-24 text-center text-2xl text-gray-600">
            Nema aktivnih porudžbina 🍔
          </div>
        )}
      </div>
    </div>
  );
}
