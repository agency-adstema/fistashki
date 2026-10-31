"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Phone, ShoppingBag, ChevronRight } from "lucide-react";
import { RESTAURANT } from "@/lib/data/menu";
import {
  buildAddToOrderPhoneUrl,
  clearActiveOrder,
  getActiveOrder,
  orderTrackingPath,
  saveActiveOrder,
  type StoredActiveOrder,
} from "@/lib/active-order";
import { ordersApi, type ApiOrder } from "@/lib/api";
import { orderStatusLabel } from "@/lib/order-status";
import { cn, formatPrice } from "@/lib/utils";

export function ActiveOrderBag() {
  const [order, setOrder] = useState<StoredActiveOrder | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const stored = getActiveOrder();
    if (!stored) {
      setOrder(null);
      return;
    }
    try {
      const data = (await ordersApi.track(stored.token)) as ApiOrder & { expired?: boolean };
      if (data.expired || !data.token) {
        setOrder(null);
        return;
      }
      const next: StoredActiveOrder = {
        token: data.token,
        displayId: data.displayId,
        status: data.status,
        total: data.total,
        updatedAt: new Date().toISOString(),
      };
      saveActiveOrder(next);
      setOrder(next);
    } catch {
      clearActiveOrder();
      setOrder(null);
    }
  }, []);

  useEffect(() => {
    setOrder(getActiveOrder());
    refresh();
    const onStorage = () => setOrder(getActiveOrder());
    window.addEventListener("gandras:active-order", onStorage);
    const interval = setInterval(refresh, 30000);
    return () => {
      window.removeEventListener("gandras:active-order", onStorage);
      clearInterval(interval);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!order) {
    return (
      <Link
        href="/order"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200"
        aria-label="Nova porudžbina"
      >
        <ShoppingBag className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200"
        aria-label="Moja porudžbina"
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F6A300] text-[10px] font-bold text-black">
          1
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
          <p className="text-[10px] font-bold tracking-widest text-gray-400">MOJA PORUDŽBINA</p>
          <p className="mt-1 text-xl font-black">{order.displayId}</p>
          <p className="mt-1 text-sm text-gray-600">
            Status: <span className="font-semibold text-[#F6A300]">{orderStatusLabel(order.status)}</span>
          </p>
          {order.total != null && (
            <p className="mt-1 text-sm text-gray-500">Ukupno: {formatPrice(order.total)}</p>
          )}

          <Link
            href={orderTrackingPath(order.token)}
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-sm font-semibold hover:bg-gray-100"
          >
            Prati porudžbinu
            <ChevronRight className="h-4 w-4" />
          </Link>

          <a
            href={buildAddToOrderPhoneUrl(order.displayId, RESTAURANT.phone)}
            className="mt-2 flex items-center gap-2 rounded-xl border border-[#F6A300]/30 bg-[#F6A300]/10 px-3 py-2.5 text-sm font-semibold text-black hover:bg-[#F6A300]/20"
          >
            <Phone className="h-4 w-4 text-[#F6A300]" />
            Dodaj još preko telefona
          </a>

          <Link
            href="/order"
            onClick={() => setOpen(false)}
            className={cn("mt-3 block text-center text-xs text-gray-400 hover:text-gray-600")}
          >
            Nova porudžbina
          </Link>
        </div>
      )}
    </div>
  );
}
