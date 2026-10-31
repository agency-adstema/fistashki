"use client";

import { useCallback, useEffect, useState } from "react";
import { deliveryApi, kitchenApi, ordersApi } from "@/lib/api";
import { getOrdersSocket } from "@/lib/socket";

export type AdminOrderBadges = {
  newOrders: number;
  kitchenOrders: number;
  deliveryOrders: number;
};

export function useAdminOrderBadges() {
  const [badges, setBadges] = useState<AdminOrderBadges>({
    newOrders: 0,
    kitchenOrders: 0,
    deliveryOrders: 0,
  });

  const refresh = useCallback(() => {
    Promise.all([
      ordersApi.listNew().then((list) => list.length).catch(() => 0),
      kitchenApi.orders().then((list) => list.length).catch(() => 0),
      deliveryApi.orders().then((list) => list.length).catch(() => 0),
    ]).then(([newOrders, kitchenOrders, deliveryOrders]) => {
      setBadges({ newOrders, kitchenOrders, deliveryOrders });
    });
  }, []);

  useEffect(() => {
    refresh();

    const onChanged = () => refresh();
    window.addEventListener("gandras:new-order", onChanged);
    window.addEventListener("gandras:orders-changed", onChanged);

    const token = localStorage.getItem("gandras_token");
    const socket = token ? getOrdersSocket(token) : null;
    socket?.on("order:new", onChanged);
    socket?.on("order:updated", onChanged);

    const interval = setInterval(refresh, 30000);

    return () => {
      window.removeEventListener("gandras:new-order", onChanged);
      window.removeEventListener("gandras:orders-changed", onChanged);
      socket?.off("order:new", onChanged);
      socket?.off("order:updated", onChanged);
      clearInterval(interval);
    };
  }, [refresh]);

  return badges;
}

export function badgeCountForHref(href: string, badges: AdminOrderBadges): number {
  if (href === "/admin/orders") return badges.newOrders;
  if (href === "/admin/kitchen") return badges.kitchenOrders;
  if (href === "/admin/delivery") return badges.deliveryOrders;
  return 0;
}
