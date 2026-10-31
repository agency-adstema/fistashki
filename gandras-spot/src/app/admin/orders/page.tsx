"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ordersApi, type ApiOrder } from "@/lib/api";
import {
  getOrdersSocket,
  requestNotificationPermission,
} from "@/lib/socket";
import {
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { OrderItemsList } from "@/components/order/OrderItemsList";
import {
  canCompleteOrder,
  orderStatusLabel,
  orderTimeline,
} from "@/lib/order-status";

const ETA_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 60];

const STATUS_LABELS: Record<string, string> = {
  NEW: "Novo",
  ACCEPTED: "Prihvaćeno",
  IN_PREPARATION: "U pripremi",
  READY: "Spremno",
  OUT_FOR_DELIVERY: "Na dostavi",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
  REJECTED: "Odbijeno",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [showEta, setShowEta] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [alert, setAlert] = useState<string | null>(null);
  const [prepNote, setPrepNote] = useState("");
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    const data = (await ordersApi.list()) as ApiOrder[];
    setOrders(data);
    setNewCount(data.filter((o) => o.status === "NEW").length);
  }, []);

  useEffect(() => {
    load();
    requestNotificationPermission();
    const token = localStorage.getItem("gandras_token");
    if (!token) return;

    const socket = getOrdersSocket(token);
    const onOrderUpdated = (order: ApiOrder) => {
      setOrders((prev) => {
        const next = prev.map((o) => (o.id === order.id ? order : o));
        setNewCount(next.filter((o) => o.status === "NEW").length);
        return next;
      });
      setSelected((s) => (s?.id === order.id ? order : s));
      window.dispatchEvent(new CustomEvent("gandras:orders-changed"));
    };
    const onOrderNew = (order: ApiOrder) => {
      setOrders((prev) => {
        const next = [order, ...prev.filter((o) => o.id !== order.id)];
        setNewCount(next.filter((o) => o.status === "NEW").length);
        return next;
      });
      setAlert(order.displayId);
    };

    socket.on("order:new", onOrderNew);
    socket.on("order:updated", onOrderUpdated);

    return () => {
      socket.off("order:new", onOrderNew);
      socket.off("order:updated", onOrderUpdated);
    };
  }, [load]);

  const handleAccept = async (minutes: number) => {
    if (!selected) return;
    const updated = (await ordersApi.accept(selected.id, minutes, prepNote || undefined)) as ApiOrder;
    await ordersApi.updateStatus(selected.id, "IN_PREPARATION");
    setSelected({ ...updated, status: "IN_PREPARATION", estimatedMinutes: minutes });
    setShowEta(false);
    setPrepNote("");
    await load();
    window.dispatchEvent(new CustomEvent("gandras:orders-changed"));
  };

  const handleReject = async () => {
    if (!selected) return;
    await ordersApi.reject(selected.id);
    setSelected(null);
    await load();
    window.dispatchEvent(new CustomEvent("gandras:orders-changed"));
  };

  const handleComplete = async () => {
    if (!selected || !canCompleteOrder(selected)) return;
    setCompleting(true);
    try {
      const updated = (await ordersApi.updateStatus(selected.id, "COMPLETED")) as ApiOrder;
      setSelected(updated);
      await load();
      window.dispatchEvent(new CustomEvent("gandras:orders-changed"));
    } finally {
      setCompleting(false);
    }
  };

  const newOrders = orders.filter((o) => o.status === "NEW");

  return (
    <div className="flex h-[calc(100vh)] flex-col">
      {alert && (
        <motion.div
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          className="bg-[#FFB800] px-6 py-3 text-center font-bold text-black shadow"
        >
          🔔 Nova porudžbina {alert}
          <button type="button" onClick={() => setAlert(null)} className="ml-4 underline">
            Zatvori
          </button>
        </motion.div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* New orders column */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black">NOVE PORUDŽBINE</h1>
              {newCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {newCount}
                </span>
              )}
            </div>
          </div>
          <ul>
            {newOrders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => { setSelected(order); setShowEta(false); }}
                  className={cn(
                    "w-full border-b border-gray-50 px-5 py-4 text-left hover:bg-gray-50",
                    selected?.id === order.id && "border-l-4 border-l-[#FFB800] bg-[#FFB800]/10",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{order.displayId}</span>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      NOVO
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.customer.firstName} · {order.deliveryMethod === "DELIVERY" ? "Dostava" : "Preuzimanje"}
                  </p>
                  <p className="font-bold text-[#FFB800]">{formatPrice(order.total)}</p>
                </button>
              </li>
            ))}
            {newOrders.length === 0 && (
              <p className="p-5 text-sm text-gray-400">Nema novih porudžbina.</p>
            )}
          </ul>
        </div>

        {/* Order detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <div className="mx-auto max-w-lg">
              <h2 className="text-2xl font-black">{selected.displayId}</h2>

              <div className="mt-5 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold">
                    {selected.customer.firstName} {selected.customer.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {selected.customer.phone}
                </div>
                {selected.customer.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    {selected.customer.address}, {selected.customer.city}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Stavke</p>
                  <div className="mt-2">
                    <OrderItemsList items={selected.items} />
                  </div>
                  <p className="mt-3 text-right text-xl font-black">{formatPrice(selected.total)}</p>
                </div>
              </div>

              {selected.status === "NEW" && (
                <div className="mt-5 flex gap-3">
                  <Button onClick={() => setShowEta(true)} className="flex-1 bg-[#FFB800] text-black hover:bg-[#e6a600]">
                    PRIHVATI PORUDŽBINU
                  </Button>
                  <Button variant="secondary" onClick={handleReject}>
                    ODBIJ
                  </Button>
                </div>
              )}

              <AnimatePresence>
                {showEta && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 rounded-2xl border bg-white p-6 shadow-sm"
                  >
                    <p className="font-bold">Vreme pripreme (min)</p>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {ETA_OPTIONS.map((min) => (
                        <button
                          key={min}
                          type="button"
                          onClick={() => handleAccept(min)}
                          className="rounded-xl border-2 border-gray-200 py-3 font-bold transition hover:border-[#FFB800] hover:bg-[#FFB800]/10 data-[active]:border-[#FFB800] data-[active]:bg-[#FFB800]"
                        >
                          {min}
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Napomena za kuhinju (opciono)"
                      value={prepNote}
                      onChange={(e) => setPrepNote(e.target.value)}
                      className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-sm"
                      rows={2}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {canCompleteOrder(selected) && (
                <div className="mt-5">
                  <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                    disabled={completing}
                    onClick={handleComplete}
                  >
                    {selected.deliveryMethod === "PICKUP"
                      ? "ZAVRŠI PORUDŽBINU — PREUZETO"
                      : "ZAVRŠI PORUDŽBINU — DOSTAVLJENO"}
                  </Button>
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Označava porudžbinu kao završenu za obračun i statistiku.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Izaberite porudžbinu
            </div>
          )}
        </div>

        {/* Timeline column */}
        {selected && (
          <div className="hidden w-72 shrink-0 border-l border-gray-200 bg-white p-6 xl:block">
            <p className="text-xs font-bold uppercase text-gray-400">Status porudžbine</p>
            <ol className="mt-6 space-y-4">
              {orderTimeline(selected.deliveryMethod).map((step, stepIdx, timeline) => {
                const idx = timeline.findIndex((s) => s === selected.status);
                const done = idx >= 0 && stepIdx <= idx;
                return (
                  <li key={step} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                        done ? "bg-[#FFB800] text-black" : "bg-gray-100 text-gray-400",
                      )}
                    >
                      {stepIdx + 1}
                    </div>
                    <span className={cn("text-sm", done ? "font-semibold" : "text-gray-400")}>
                      {STATUS_LABELS[step] ?? orderStatusLabel(step)}
                    </span>
                  </li>
                );
              })}
            </ol>
            {canCompleteOrder(selected) && (
              <Button
                className="mt-6 w-full bg-green-600 text-white hover:bg-green-700"
                disabled={completing}
                onClick={handleComplete}
              >
                {selected.deliveryMethod === "PICKUP" ? "Označi preuzeto" : "Označi dostavljeno"}
              </Button>
            )}
            {selected.estimatedMinutes && (
              <p className="mt-6 rounded-xl bg-gray-50 p-4 text-center text-sm">
                Procena: <strong>{selected.estimatedMinutes} min</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom table */}
      <div className="max-h-56 overflow-auto border-t border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Broj</th>
              <th className="px-4 py-3">Kupac</th>
              <th className="px-4 py-3">Način</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ukupno</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 20).map((o) => (
              <tr
                key={o.id}
                className="cursor-pointer border-t border-gray-50 hover:bg-gray-50"
                onClick={() => setSelected(o)}
              >
                <td className="px-4 py-2 font-bold">{o.displayId}</td>
                <td className="px-4 py-2">{o.customer.firstName}</td>
                <td className="px-4 py-2">{o.deliveryMethod === "DELIVERY" ? "Dostava" : "Preuzimanje"}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-2 font-bold">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
