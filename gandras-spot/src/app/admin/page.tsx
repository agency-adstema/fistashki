"use client";

import { useEffect, useState } from "react";
import { dashboardApi, type DashboardData } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { orderStatusLabel } from "@/lib/order-status";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    dashboardApi.get().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Učitavanje...
      </div>
    );
  }

  const { stats, revenueByDay, recentOrders } = data;
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  const cards = [
    { label: "Ukupno porudžbina", value: stats.totalOrders, icon: ShoppingBag, color: "text-[#FFB800]" },
    { label: "Aktivne", value: stats.activeOrders, icon: Clock, color: "text-orange-500" },
    { label: "Završene danas", value: stats.completedOrders, icon: CheckCircle, color: "text-green-600" },
    { label: "Otkazane", value: stats.cancelledOrders, icon: XCircle, color: "text-red-500" },
    { label: "Ukupan prihod", value: formatPrice(stats.revenue), icon: Wallet, color: "text-purple-600" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Dobrodošao, Admin! 👋</h1>
          <p className="text-gray-500">Pregled poslovanja za danas</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-sm shadow-sm">
          Današnji prihod: <strong>{formatPrice(stats.revenue)}</strong>
          {stats.revenueChangePercent !== 0 && (
            <span className={stats.revenueChangePercent > 0 ? "ml-2 text-green-600" : "ml-2 text-red-500"}>
              {stats.revenueChangePercent > 0 ? "+" : ""}
              {stats.revenueChangePercent}%
            </span>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">{c.label}</p>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="mt-2 text-2xl font-black">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold">
            <TrendingUp className="h-4 w-4 text-[#FFB800]" /> Prihod po danima
          </h2>
          <div className="mt-6 flex h-48 items-end justify-around gap-2">
            {revenueByDay.map((d) => (
              <div
                key={d.label}
                className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              >
                <div
                  className="pointer-events-none absolute left-1/2 top-2 z-10 hidden w-max max-w-[10rem] -translate-x-1/2 rounded-lg bg-black px-2.5 py-1.5 text-center text-xs text-white opacity-0 shadow-lg transition group-hover:block group-hover:opacity-100"
                  role="tooltip"
                >
                  <p className="font-bold tabular-nums">{formatPrice(d.revenue)}</p>
                  <p className="mt-0.5 text-[10px] text-gray-300">
                    {d.orders} {d.orders === 1 ? "porudžbina" : "porudžbine"}
                  </p>
                </div>
                <div
                  className="w-8 cursor-pointer rounded-t-lg bg-[#FFB800] transition group-hover:bg-[#e6a600]"
                  style={{
                    height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue ? 6 : 2)}%`,
                    minHeight: d.revenue ? 8 : 4,
                  }}
                />
                <span className="text-[10px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold">Najnovije porudžbine</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-gray-400">Nema porudžbina.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold">{o.displayId}</p>
                    <p className="text-xs text-gray-500">{o.customer.firstName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatPrice(o.total)}</p>
                    <p className="text-xs text-gray-500">{orderStatusLabel(o.status)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
