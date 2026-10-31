"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Phone, User } from "lucide-react";
import { deliveryApi, ordersApi } from "@/lib/api";
import { DeliveryRouteMap } from "@/components/delivery/DeliveryRouteMap";
import { Button } from "@/components/ui/button";
import { getOrdersSocket } from "@/lib/socket";
import { formatPrice } from "@/lib/utils";
import { toTelHref } from "@/lib/phone";
import { orderStatusLabel } from "@/lib/order-status";
import { DeliveryItemsList } from "@/components/order/DeliveryItemsList";

interface DeliveryOrder {
  id: string;
  displayId: string;
  status: string;
  customerFirstName: string;
  customerLastName: string | null;
  customerPhone: string;
  customerAddress: string | null;
  customerCity: string | null;
  customerNote: string | null;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice?: number;
    kind?: string | null;
    options?: Record<string, unknown> | null;
  }>;
}

export default function DeliveryPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    deliveryApi.orders().then((data) => setOrders(data as DeliveryOrder[]));
  }, []);

  useEffect(() => {
    load();
    const token = localStorage.getItem("gandras_token");
    if (!token) return;

    const socket = getOrdersSocket(token);
    const onOrderEvent = () => {
      void load();
      window.dispatchEvent(new CustomEvent("gandras:orders-changed"));
    };
    socket.on("order:updated", onOrderEvent);
    socket.on("order:new", onOrderEvent);
    const interval = setInterval(onOrderEvent, 15_000);
    return () => {
      socket.off("order:updated", onOrderEvent);
      socket.off("order:new", onOrderEvent);
      clearInterval(interval);
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
    <div className="min-h-screen bg-[#0f1115] p-6 text-white">
      <h1 className="text-3xl font-black text-[#FFB800]">DOSTAVA</h1>
      <p className="text-gray-400">
        {orders.length} {orders.length === 1 ? "porudžbina" : "porudžbina"} spremno za dostavu
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {orders.map((order) => {
          const fullName = [order.customerFirstName, order.customerLastName].filter(Boolean).join(" ");
          const addressLine = [order.customerAddress, order.customerCity].filter(Boolean).join(", ");
          const telHref = toTelHref(order.customerPhone);

          return (
            <div key={order.id} className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-3xl font-black text-[#FFB800]">{order.displayId}</p>
                  <p className="mt-1 text-sm text-gray-400">{orderStatusLabel(order.status)}</p>
                </div>
                <p className="text-lg font-bold">{formatPrice(order.total)}</p>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl bg-black/40 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4 text-[#FFB800]" />
                  {fullName}
                </p>
                {addressLine && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                    <span>{addressLine}</span>
                  </p>
                )}
                {telHref ? (
                  <a
                    href={telHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB800] px-4 py-3.5 text-base font-black text-black active:scale-[0.98]"
                  >
                    <Phone className="h-5 w-5" />
                    Pozovi {order.customerPhone}
                  </a>
                ) : (
                  <p className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    Nema telefona
                  </p>
                )}
                {order.customerNote && (
                  <p className="rounded-lg bg-yellow-900/30 p-2 text-yellow-200">💬 {order.customerNote}</p>
                )}
              </div>

              <div className="mt-4">
                <DeliveryItemsList items={order.items} />
              </div>

              <DeliveryRouteMap
                destinationAddress={order.customerAddress}
                destinationCity={order.customerCity}
              />

              <div className="mt-5 flex flex-wrap gap-3">
                {order.status === "READY" ? (
                  <Button
                    className="bg-[#FFB800] text-black"
                    disabled={busyId === order.id}
                    onClick={() => setStatus(order.id, "OUT_FOR_DELIVERY")}
                  >
                    Na dostavi
                  </Button>
                ) : (
                  <Button className="bg-[#FFB800] text-black" disabled>
                    Na dostavi ✓
                  </Button>
                )}
                <Button
                  variant="secondary"
                  disabled={busyId === order.id || order.status !== "OUT_FOR_DELIVERY"}
                  onClick={() => setStatus(order.id, "COMPLETED")}
                >
                  Završeno
                </Button>
              </div>
              {order.status === "OUT_FOR_DELIVERY" && (
                <p className="mt-2 text-xs text-gray-500">
                  Kurir je preuzeo dostavu — završava kada označi „isporučeno“ u svom portalu.
                </p>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="col-span-full py-24 text-center text-xl text-gray-600">
            Nema porudžbina za dostavu
          </div>
        )}
      </div>
    </div>
  );
}
