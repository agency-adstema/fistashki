"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { ordersApi, type ApiOrder } from "@/lib/api";
import {
  getOrdersSocket,
  initOrderAudio,
  isOrderAudioUnlocked,
  playNewOrderSound,
  requestNotificationPermission,
  showBrowserNotification,
} from "@/lib/socket";
import { cn } from "@/lib/utils";

export function AdminOrderBell() {
  const [newCount, setNewCount] = useState(0);
  const [ringing, setRinging] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const list = (await ordersApi.listNew()) as ApiOrder[];
      setNewCount(list.length);
    } catch {
      // ignore
    }
  }, []);

  const onNewOrder = useCallback(
    (order: ApiOrder) => {
      setRinging(true);
      playNewOrderSound();
      showBrowserNotification("Nova porudžbina", `${order.displayId} — ${order.customer.firstName}`);
      window.dispatchEvent(new CustomEvent("gandras:new-order", { detail: order }));
      void refreshCount();
      setTimeout(() => setRinging(false), 1200);
    },
    [refreshCount],
  );

  const onOrderUpdated = useCallback(() => {
    void refreshCount();
    window.dispatchEvent(new CustomEvent("gandras:orders-changed"));
  }, [refreshCount]);

  useEffect(() => {
    refreshCount();
    requestNotificationPermission();
    initOrderAudio();
    setAudioReady(isOrderAudioUnlocked());

    const onUnlock = () => setAudioReady(true);
    document.addEventListener("pointerdown", onUnlock, { once: true });
    document.addEventListener("keydown", onUnlock, { once: true });

    const token = localStorage.getItem("gandras_token");
    if (!token) return;

    const socket = getOrdersSocket(token);
    socket.on("order:new", onNewOrder);
    socket.on("order:updated", onOrderUpdated);

    const onChanged = () => void refreshCount();
    window.addEventListener("gandras:orders-changed", onChanged);

    return () => {
      socket.off("order:new", onNewOrder);
      socket.off("order:updated", onOrderUpdated);
      window.removeEventListener("gandras:orders-changed", onChanged);
      document.removeEventListener("pointerdown", onUnlock);
      document.removeEventListener("keydown", onUnlock);
    };
  }, [refreshCount, onNewOrder, onOrderUpdated]);

  return (
    <div className="flex items-center gap-3">
      {!audioReady && (
        <span className="hidden text-xs text-amber-700 sm:inline" title="Kliknite bilo gde na stranici">
          Kliknite za zvuk porudžbina
        </span>
      )}
      <Link
        href="/admin/orders"
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50",
          ringing && "animate-pulse ring-2 ring-[#FFB800]/50",
        )}
        aria-label={newCount > 0 ? `${newCount} novih porudžbina` : "Notifikacije porudžbina"}
      >
        <Bell className={cn("h-5 w-5 text-gray-700", ringing && "text-[#FFB800]")} />
        {newCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {newCount > 9 ? "9+" : newCount}
          </span>
        )}
      </Link>
    </div>
  );
}
