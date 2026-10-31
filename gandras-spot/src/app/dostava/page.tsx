"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Phone, User, Wallet, Package, TrendingUp } from "lucide-react";
import { courierApi, type CourierDashboard, type CourierDeliveryOrder } from "@/lib/api";
import { DeliveryRouteMap } from "@/components/delivery/DeliveryRouteMap";
import { Button } from "@/components/ui/button";
import { getOrdersSocket } from "@/lib/socket";
import { formatPrice } from "@/lib/utils";
import { toTelHref } from "@/lib/phone";
import { orderStatusLabel } from "@/lib/order-status";
import { DeliveryItemsList } from "@/components/order/DeliveryItemsList";

function DeliveryCard({
  order,
  mode,
  busyId,
  onClaim,
  onComplete,
}: {
  order: CourierDeliveryOrder;
  mode: "queue" | "active";
  busyId: string | null;
  onClaim?: (id: string) => void;
  onComplete?: (id: string) => void;
}) {
  const fullName = [order.customerFirstName, order.customerLastName].filter(Boolean).join(" ");
  const addressLine = [order.customerAddress, order.customerCity].filter(Boolean).join(", ");
  const telHref = toTelHref(order.customerPhone);

  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
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

      <DeliveryRouteMap destinationAddress={order.customerAddress} destinationCity={order.customerCity} />

      <div className="mt-5 flex flex-wrap gap-3">
        {mode === "queue" && onClaim && (
          <Button
            className="bg-[#FFB800] text-black"
            disabled={busyId === order.id}
            onClick={() => onClaim(order.id)}
          >
            Preuzmi dostavu
          </Button>
        )}
        {mode === "active" && onComplete && (
          <>
            <Button
              className="bg-[#FFB800] text-black"
              disabled={busyId === order.id}
              onClick={() => onComplete(order.id)}
            >
              Završeno — isporučeno
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CourierPortalPage() {
  const [data, setData] = useState<CourierDashboard | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    courierApi
      .dashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const token = localStorage.getItem("gandras_token");
    if (!token) return;
    const socket = getOrdersSocket(token);
    socket.on("order:updated", load);
    socket.on("order:new", load);
    const interval = setInterval(load, 30_000);
    return () => {
      socket.off("order:updated", load);
      socket.off("order:new", load);
      clearInterval(interval);
    };
  }, [load]);

  const claim = async (id: string) => {
    setBusyId(id);
    try {
      const next = await courierApi.claim(id);
      setData(next);
    } finally {
      setBusyId(null);
    }
  };

  const complete = async (id: string) => {
    setBusyId(id);
    try {
      const next = await courierApi.complete(id);
      setData(next);
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !data) {
    return <div className="py-24 text-center text-gray-500">Učitavanje...</div>;
  }

  if (!data) {
    return (
      <div className="py-24 text-center text-gray-500">
        Nalog nije povezan sa dostavljačem. Kontaktirajte admina.
      </div>
    );
  }

  const { driver, queue, active, earnings } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#FFB800]">Dobrodošli, {driver.firstName}</h1>
        <p className="text-gray-400">Isplata po dostavi: {formatPrice(driver.payPerDelivery)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Wallet className="h-4 w-4 text-[#FFB800]" />
            Danas
          </div>
          <p className="mt-2 text-2xl font-black">{formatPrice(earnings.today.total)}</p>
          <p className="text-sm text-gray-500">{earnings.today.count} dostava</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="h-4 w-4 text-[#FFB800]" />
            Ova nedelja
          </div>
          <p className="mt-2 text-2xl font-black">{formatPrice(earnings.week.total)}</p>
          <p className="text-sm text-gray-500">{earnings.week.count} dostava</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Package className="h-4 w-4 text-[#FFB800]" />
            Ovaj mesec
          </div>
          <p className="mt-2 text-2xl font-black">{formatPrice(earnings.month.total)}</p>
          <p className="text-sm text-gray-500">{earnings.month.count} dostava</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-black">Moje aktivne dostave ({active.length})</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {active.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              mode="active"
              busyId={busyId}
              onComplete={complete}
            />
          ))}
          {active.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-gray-700 py-12 text-center text-gray-500">
              Nema aktivnih dostava
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black">Spremno za preuzimanje ({queue.length})</h2>
        <p className="mt-1 text-sm text-gray-500">Porudžbine koje čekaju dostavljača</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {queue.map((order) => (
            <DeliveryCard key={order.id} order={order} mode="queue" busyId={busyId} onClaim={claim} />
          ))}
          {queue.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-gray-700 py-12 text-center text-gray-500">
              Nema novih dostava u redu
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-black">Današnje završene dostave</h2>
        <p className="mt-1 text-xs text-gray-500 sm:hidden">Povuci levo / desno za celu tabelu</p>
        <div className="mt-4 overflow-x-auto overscroll-x-contain rounded-2xl border border-gray-800 [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-black/40 text-gray-400">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Porudžbina</th>
                <th className="whitespace-nowrap px-4 py-3">Adresa</th>
                <th className="whitespace-nowrap px-4 py-3">Vreme</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Zarada</th>
              </tr>
            </thead>
            <tbody>
              {earnings.today.deliveries.map((d) => (
                <tr key={d.id} className="border-t border-gray-800">
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-[#FFB800]">{d.displayId}</td>
                  <td className="max-w-[14rem] px-4 py-3 text-gray-300 sm:max-w-none">
                    <span className="block truncate sm:whitespace-normal">
                      {[d.customerAddress, d.customerCity].filter(Boolean).join(", ") || "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                    {new Date(d.completedAt).toLocaleTimeString("sr-RS", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                    {formatPrice(d.pay)}
                  </td>
                </tr>
              ))}
              {earnings.today.deliveries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Još nema završenih dostava danas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
