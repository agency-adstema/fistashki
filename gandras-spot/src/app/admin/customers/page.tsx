"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { customersApi, type CustomerRow } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    customersApi
      .list()
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s/g, "");
    if (!q) return rows;
    return rows.filter((c) => {
      const phone = c.phone.replace(/\s/g, "").toLowerCase();
      const name = `${c.firstName} ${c.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [rows, query]);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black">Kupci</h1>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži po imenu ili broju telefona..."
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#F6A300] focus:outline-none focus:ring-2 focus:ring-[#F6A300]/20"
        />
      </div>

      {loading ? (
        <p className="mt-8 text-gray-400">Učitavanje...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-gray-400">
          {query.trim() ? "Nema rezultata za tu pretragu." : "Još nema kupaca u bazi."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Ime</th>
                <th className="px-4 py-3">Prezime</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Porudžbina</th>
                <th className="px-4 py-3">Ukupno potrošeno</th>
                <th className="px-4 py-3">Prosečan ček</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-bold text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{c.firstName}</td>
                  <td className="px-4 py-3">{c.lastName ?? "—"}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3 font-bold text-[#F6A300]">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3">{formatPrice(c.avgCheck)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
