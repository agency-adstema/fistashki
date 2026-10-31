"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ChefHat, Package, Truck, PartyPopper, Phone, Copy, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ordersApi, type ApiOrder } from "@/lib/api";
import { getOrdersSocket } from "@/lib/socket";
import { formatPrice, cn } from "@/lib/utils";
import { toTelHref } from "@/lib/phone";
import { orderStatusLabel } from "@/lib/order-status";
import { buildAddToOrderPhoneUrl, clearActiveOrder, saveActiveOrder, updateActiveOrder, orderTrackingPath } from "@/lib/active-order";
import { useCountdownMinutes } from "@/hooks/useCountdownMinutes";
import { OrderItemsList } from "@/components/order/OrderItemsList";

const PICKUP_TIMELINE = [
  { key: "NEW", label: "Primljena", icon: Check },
  { key: "ACCEPTED", label: "Prihvaćena", icon: Check },
  { key: "IN_PREPARATION", label: "U pripremi", icon: ChefHat },
  { key: "READY", label: "Spremno za preuzimanje", icon: Package },
  { key: "COMPLETED", label: "Završena", icon: PartyPopper },
] as const;

const DELIVERY_TIMELINE = [
  { key: "NEW", label: "Primljena", icon: Check },
  { key: "ACCEPTED", label: "Prihvaćena", icon: Check },
  { key: "IN_PREPARATION", label: "U pripremi", icon: ChefHat },
  { key: "READY", label: "Spremna", icon: Package },
  { key: "OUT_FOR_DELIVERY", label: "Na dostavi", icon: Truck },
  { key: "COMPLETED", label: "Završena", icon: PartyPopper },
] as const;

function statusIndex(status: string, timeline: readonly { key: string }[]) {
  const idx = timeline.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  if (status === "CANCELLED" || status === "REJECTED") return -1;
  return 0;
}

export function OrderTracking({ token: tokenProp }: { token: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tokenFromPath = pathname.startsWith("/order/")
    ? decodeURIComponent(pathname.replace(/^\/order\//, "").split("?")[0])
    : "";
  const token = decodeURIComponent(tokenFromPath || tokenProp || "");
  const justConfirmed = searchParams.get("confirmed") === "1";
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const minutesLeft = useCountdownMinutes(order?.estimatedReadyAt, order?.estimatedMinutes);

  const persistOrder = useCallback((data: ApiOrder) => {
    saveActiveOrder({
      token: data.token,
      displayId: data.displayId,
      status: data.status,
      total: data.total,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const applyTrackResult = useCallback(
    (data: ApiOrder & { expired?: boolean }) => {
      if (data.expired) {
        setExpired(true);
        setOrder(null);
        clearActiveOrder();
        return;
      }
      setOrder(data);
      persistOrder(data);
    },
    [persistOrder],
  );

  const fetchOrder = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!token) return;
      if (!opts?.silent) setLoading(true);
      try {
        const data = (await ordersApi.track(token)) as ApiOrder & { expired?: boolean };
        applyTrackResult(data);
      } catch {
        if (!opts?.silent) {
          setOrder(null);
          clearActiveOrder();
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [token, applyTrackResult],
  );

  const statusRef = useRef<string | null>(null);
  statusRef.current = order?.status ?? null;

  const isTerminalStatus = (status: string | null | undefined) =>
    status === "COMPLETED" || status === "CANCELLED" || status === "REJECTED";

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setOrder(null);
      return;
    }

    void fetchOrder();

    const socket = getOrdersSocket(undefined, token);
    const onUpdated = (updated: ApiOrder) => {
      // Samo update za ovaj track token — sprečava mešanje ETA između porudžbina.
      if (updated.token && updated.token !== token) return;
      setOrder(updated);
      updateActiveOrder({
        token: updated.token,
        status: updated.status,
        displayId: updated.displayId,
        total: updated.total,
      });
    };
    socket.on("order:updated", onUpdated);

    /** Backup kad socket nije dostupan — osvežava status bez reload-a stranice */
    const POLL_MS = 30_000;
    const interval = setInterval(() => {
      if (isTerminalStatus(statusRef.current)) return;
      void fetchOrder({ silent: true });
    }, POLL_MS);

    return () => {
      socket.off("order:updated", onUpdated);
      clearInterval(interval);
    };
  }, [token, fetchOrder]);

  const trackingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${orderTrackingPath(token)}`
      : orderTrackingPath(token);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-24 text-gray-400">
          Učitavanje...
        </main>
        <Footer />
      </>
    );
  }

  if (expired) {
    return (
      <>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
          <h1 className="text-2xl font-black">Ova porudžbina je završena.</h1>
          <p className="mt-2 text-gray-500">Detalji više nisu dostupni (24h isteklo).</p>
          <Button asChild className="mt-6">
            <Link href="/order">Poruči ponovo</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
          <h1 className="text-2xl font-black">Porudžbina nije pronađena</h1>
          <Button asChild className="mt-6">
            <Link href="/order">Nova porudžbina</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  const isPickup = order.deliveryMethod === "PICKUP";
  const timeline = isPickup ? PICKUP_TIMELINE : DELIVERY_TIMELINE;
  const currentIdx = statusIndex(order.status, timeline);
  const isDone = order.status === "COMPLETED";
  const isCancelled = order.status === "CANCELLED" || order.status === "REJECTED";
  const showAddMore = !isDone && !isCancelled;
  const showCountdown =
    !isDone && !isCancelled && order.status !== "READY" && minutesLeft !== null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12 sm:px-6">
        {(justConfirmed || order.status === "NEW") && !isDone && !isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-[#FFB800]/30 bg-[#FFB800]/10 p-6 text-center"
          >
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#FFB800]" />
            <h2 className="mt-3 text-2xl font-black">Hvala što ste poručili!</h2>
            <p className="mt-2 text-gray-600">
              Vaša porudžbina <strong>{order.displayId}</strong> je primljena. Sačuvajte link ispod da
              pratite status u realnom vremenu.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button type="button" variant="secondary" onClick={copyLink} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link kopiran" : "Kopiraj link za praćenje"}
              </Button>
            </div>
            <p className="mt-3 break-all text-xs text-gray-500">{trackingUrl}</p>
          </motion.div>
        )}

        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#FFB800]">PORUDŽBINA</p>
          <h1 className="mt-2 text-3xl font-black">{order.displayId}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Trenutni status: <span className="font-bold text-black">{orderStatusLabel(order.status)}</span>
          </p>
          {showCountdown && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-lg text-gray-600">
              Procenjeno vreme: još{" "}
              <span className="font-black text-[#FFB800]">{minutesLeft} min</span>
            </motion.p>
          )}
          {order.status === "READY" && !isCancelled && (
            <p className="mt-4 text-lg font-semibold text-[#FFB800]">
              {isPickup
                ? "Vaša porudžbina je spremna za preuzimanje u lokalu!"
                : "Vaša porudžbina je spremna i uskoro kreće na dostavu!"}
            </p>
          )}
          {order.status === "IN_PREPARATION" && (
            <p className="mt-2 text-sm text-gray-500">Kuvar trenutno priprema vaš burger 🍔</p>
          )}
        </div>

        {!isCancelled && (
          <ol className="mt-12 space-y-0">
            {timeline.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              const courierTel =
                step.key === "OUT_FOR_DELIVERY" && order.status === "OUT_FOR_DELIVERY"
                  ? toTelHref(order.driver?.phone)
                  : null;
              return (
                <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < timeline.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-5 top-10 h-full w-0.5",
                        done ? "bg-[#FFB800]" : "bg-gray-200",
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      done ? "bg-[#FFB800] text-black" : "bg-gray-100 text-gray-400",
                      active && "ring-4 ring-[#FFB800]/30",
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pt-1.5">
                    <p className={cn("font-bold", done ? "text-black" : "text-gray-400")}>{step.label}</p>
                    {courierTel && (
                      <Button asChild size="sm" className="shrink-0 gap-1.5 bg-[#FFB800] text-black hover:bg-[#e6a600]">
                        <a href={courierTel}>
                          <Phone className="h-4 w-4" />
                          Pozovi kurira
                        </a>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {isCancelled && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="font-bold text-red-700">{orderStatusLabel(order.status)}</p>
            <p className="mt-2 text-sm text-red-600">Kontaktirajte nas ako imate pitanja.</p>
          </div>
        )}

        {order.items?.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-bold">Stavke</h2>
            <div className="mt-3">
              <OrderItemsList
                items={order.items.map((item) => ({
                  name: item.name,
                  totalPrice: item.totalPrice,
                  quantity: item.quantity,
                  kind: item.kind,
                  options: item.options,
                }))}
              />
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">Ukupno</p>
          <p className="text-2xl font-black">{formatPrice(order.total)}</p>
        </div>

        {showAddMore && (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-bold">Zaboravili ste nešto?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Pozovite nas i recite da želite da dodate još stavki u porudžbinu{" "}
              <strong>{order.displayId}</strong>.
            </p>
            <Button asChild className="mt-4 w-full gap-2 sm:w-auto">
              <a href={buildAddToOrderPhoneUrl()}>
                <Phone className="h-4 w-4" />
                Pozovi i dodaj još
              </a>
            </Button>
          </div>
        )}

        {isDone && (
          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link href="/order">Poruči ponovo</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
