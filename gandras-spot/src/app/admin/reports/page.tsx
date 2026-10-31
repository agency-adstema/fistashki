"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { reportsApi, type ReportsSummary } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Package, AlertTriangle, Calendar } from "lucide-react";

type PeriodPreset = "today" | "yesterday" | "week" | "month" | "custom";

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function rangeForPreset(preset: PeriodPreset): { from: string; to: string } {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (preset === "today") {
    const s = toDateInput(today);
    return { from: s, to: s };
  }
  if (preset === "yesterday") {
    const y = toDateInput(addDays(today, -1));
    return { from: y, to: y };
  }
  if (preset === "week") {
    return { from: toDateInput(addDays(today, -6)), to: toDateInput(today) };
  }
  // month
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { from: toDateInput(start), to: toDateInput(end) };
}

const PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: "today", label: "Danas" },
  { id: "yesterday", label: "Juče" },
  { id: "week", label: "7 dana" },
  { id: "month", label: "Ovaj mesec" },
  { id: "custom", label: "Prilagođeno" },
];

function formatPeriodLabel(from: string, to: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}.`;
  };
  if (from === to) return fmt(from);
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function AdminReportsPage() {
  const [preset, setPreset] = useState<PeriodPreset>("month");
  const [from, setFrom] = useState(() => rangeForPreset("month").from);
  const [to, setTo] = useState(() => rangeForPreset("month").to);
  const [data, setData] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (fromDate: string, toDate: string) => {
    setLoading(true);
    setError("");
    try {
      const raw = await reportsApi.summary(fromDate, toDate);
      setData({
        ...raw,
        revenue: raw.revenue ?? 0,
        avgOrderValue: raw.avgOrderValue ?? 0,
        topProducts: (raw.topProducts ?? []).map((p) => ({
          name: p.name,
          count: p.count ?? 0,
          revenue: p.revenue ?? 0,
        })),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška pri učitavanju");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(from, to);
  }, [from, to, load]);

  const applyPreset = (next: PeriodPreset) => {
    setPreset(next);
    if (next === "custom") return;
    const range = rangeForPreset(next);
    setFrom(range.from);
    setTo(range.to);
  };

  const periodLabel = useMemo(() => formatPeriodLabel(from, to), [from, to]);

  const downloadCsv = async () => {
    const token = localStorage.getItem("gandras_token");
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4100/api";
    const q = new URLSearchParams({ from, to });
    const res = await fetch(`${base}/admin/reports/export/csv?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `porudzbine-${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = data
    ? [
        { label: "Prihod (period)", value: formatPrice(data.revenue), icon: TrendingUp },
        { label: "Porudžbine", value: data.totalOrders, icon: Package },
        { label: "Završene", value: data.completedOrders, icon: Package },
        { label: "Prosečna porudžbina", value: formatPrice(data.avgOrderValue), icon: TrendingUp },
        {
          label: "Dostava / Preuzimanje",
          value: `${data.deliveryCount} / ${data.pickupCount}`,
          icon: Package,
        },
        {
          label: "Gotovina / Kartica",
          value: `${data.cashCount} / ${data.cardCount}`,
          icon: Package,
        },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Izveštaji</h1>
          <p className="text-gray-500">Pregled poslovanja · {periodLabel}</p>
        </div>
        <Button onClick={downloadCsv} className="gap-2" disabled={loading}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Calendar className="h-4 w-4 text-[#FFB800]" />
          Period
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                preset === p.id
                  ? "border-[#FFB800] bg-[#FFB800] text-black"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:items-end">
          <label className="block text-sm">
            <span className="font-medium text-gray-600">Od</span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => {
                setPreset("custom");
                setFrom(e.target.value);
              }}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#F6A300] focus:outline-none focus:ring-2 focus:ring-[#F6A300]/20"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-600">Do</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => {
                setPreset("custom");
                setTo(e.target.value);
              }}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#F6A300] focus:outline-none focus:ring-2 focus:ring-[#F6A300]/20"
            />
          </label>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading && !data ? (
        <div className="flex h-64 items-center justify-center text-gray-400">Učitavanje...</div>
      ) : data ? (
        <>
          <div className={cn("mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", loading && "opacity-60")}>
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500">{c.label}</p>
                  <c.icon className="h-4 w-4 text-[#FFB800]" />
                </div>
                <p className="mt-2 text-2xl font-black">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold">
                <Users className="h-4 w-4 text-[#FFB800]" /> Top kupci
              </h2>
              <p className="mt-1 text-xs text-gray-400">Ukupno potrošeno (sve vreme)</p>
              {data.topCustomers.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">Nema podataka.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.topCustomers.map((c, i) => (
                    <li key={c.id} className="flex justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                      <span>
                        {i + 1}. {c.firstName} {c.lastName ?? ""} · {c.phone}
                      </span>
                      <span className="font-bold">{formatPrice(c.totalSpent)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold">
                <TrendingUp className="h-4 w-4 text-[#FFB800]" /> Najprodavanije stavke
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Burgeri i pića u periodu · {periodLabel}
              </p>
              {data.topProducts.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">Nema završenih porudžbina u periodu.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.topProducts.map((p) => (
                    <li
                      key={p.name}
                      className="flex justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium">{p.name}</span>
                      <div className="shrink-0 text-right">
                        <p className="font-bold">{p.count}×</p>
                        <p className="text-xs font-semibold text-[#F6A300]">{formatPrice(p.revenue)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {data.lowStock.length > 0 && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6">
              <h2 className="flex items-center gap-2 font-bold text-red-700">
                <AlertTriangle className="h-4 w-4" /> Niska zaliha
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-red-800">
                {data.lowStock.map((s) => (
                  <li key={s.id}>
                    {s.name}: {s.quantity} {s.unit} (min {s.minQuantity})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
