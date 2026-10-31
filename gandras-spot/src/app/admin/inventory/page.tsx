"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { inventoryApi, type StockRow, type SupplierRow } from "@/lib/api";
import { Button } from "@/components/ui/button";

type StockDraft = { quantity: string; minQuantity: string };

export default function AdminInventoryPage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [deliveryQty, setDeliveryQty] = useState<Record<string, number>>({});
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [loading, setLoading] = useState(true);
  const [supplierDrafts, setSupplierDrafts] = useState<Record<string, string>>({});
  const [stockDrafts, setStockDrafts] = useState<Record<string, StockDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const [s, st] = await Promise.all([inventoryApi.suppliers(), inventoryApi.stock()]);
    setSuppliers(s);
    setStock(st);
    setSupplierDrafts(Object.fromEntries(s.map((row) => [row.id, row.name])));
    setStockDrafts(
      Object.fromEntries(
        st.map((row) => [
          row.id,
          { quantity: String(row.quantity), minQuantity: String(row.minQuantity) },
        ]),
      ),
    );
    if (!selectedSupplier && s[0]) setSelectedSupplier(s[0].id);
  };

  useEffect(() => {
    load()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addSupplier = async () => {
    if (!supplierName.trim()) return;
    await inventoryApi.createSupplier({ name: supplierName.trim() });
    setSupplierName("");
    await load();
  };

  const saveSupplier = async (id: string) => {
    const name = supplierDrafts[id]?.trim();
    if (!name) return;
    setSavingId(id);
    try {
      await inventoryApi.updateSupplier(id, { name });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const saveStock = async (id: string) => {
    const draft = stockDrafts[id];
    if (!draft) return;
    const quantity = Number(draft.quantity);
    const minQuantity = Number(draft.minQuantity);
    if (Number.isNaN(quantity) || quantity < 0) return;
    if (Number.isNaN(minQuantity) || minQuantity < 0) return;

    setSavingId(id);
    try {
      await inventoryApi.updateStock(id, { quantity, minQuantity });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const recordDelivery = async () => {
    const items = Object.entries(deliveryQty)
      .filter(([, q]) => q > 0)
      .map(([stockItemId, quantity]) => ({ stockItemId, quantity }));
    if (!selectedSupplier || items.length === 0) return;
    await inventoryApi.delivery({ supplierId: selectedSupplier, items });
    setDeliveryQty({});
    await load();
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Učitavanje...</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black">Zalihe & dobavljači</h1>
      <p className="text-gray-500">
        Praćenje stanja — kada neko poruči kola, automatski se skida sa zaliha. Klikni na broj da ispraviš popis.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold">Dobavljači</h2>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder="Naziv dobavljača"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
            <Button onClick={addSupplier}>Dodaj</Button>
          </div>
          <ul className="mt-4 space-y-2">
            {suppliers.map((s) => {
              const draft = supplierDrafts[s.id] ?? s.name;
              const changed = draft.trim() !== s.name;

              return (
                <li key={s.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium"
                    value={draft}
                    onChange={(e) =>
                      setSupplierDrafts((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && changed) saveSupplier(s.id);
                    }}
                  />
                  {changed && (
                    <Button
                      size="sm"
                      className="shrink-0 px-3"
                      disabled={savingId === s.id}
                      onClick={() => saveSupplier(s.id)}
                      aria-label="Sačuvaj"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold">Stanje zaliha</h2>
          <p className="mt-1 text-xs text-gray-400">Unesi tačan broj i klikni Sačuvaj (popis robe)</p>
          <ul className="mt-4 space-y-2">
            {stock.map((item) => {
              const low = item.quantity <= item.minQuantity;
              const draft = stockDrafts[item.id] ?? {
                quantity: String(item.quantity),
                minQuantity: String(item.minQuantity),
              };
              const changed =
                Number(draft.quantity) !== item.quantity ||
                Number(draft.minQuantity) !== item.minQuantity;

              return (
                <li
                  key={item.id}
                  className={`rounded-xl px-4 py-3 text-sm ${low ? "bg-red-50" : "bg-gray-50"}`}
                >
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.supplier?.name ? item.supplier.name : "Bez dobavljača"}
                      </p>
                    </div>
                    <div className="flex items-end gap-2">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400">Količina</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            className={`w-20 rounded-lg border px-2 py-1.5 text-lg font-black ${
                              low ? "border-red-300 text-red-600" : "border-gray-200 text-[#F6A300]"
                            }`}
                            value={draft.quantity}
                            onChange={(e) =>
                              setStockDrafts((prev) => ({
                                ...prev,
                                [item.id]: { ...draft, quantity: e.target.value },
                              }))
                            }
                          />
                          <span className="text-xs text-gray-500">{item.unit}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-gray-400">Min</label>
                        <input
                          type="number"
                          min={0}
                          className="w-14 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                          value={draft.minQuantity}
                          onChange={(e) =>
                            setStockDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...draft, minQuantity: e.target.value },
                            }))
                          }
                        />
                      </div>
                      {changed && (
                        <Button
                          size="sm"
                          className="mb-0.5"
                          disabled={savingId === item.id}
                          onClick={() => saveStock(item.id)}
                        >
                          {savingId === item.id ? "..." : "Sačuvaj"}
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold">Prijava isporuke (npr. +50 kola)</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-gray-500">Dobavljač</label>
            <select
              className="mt-1 block rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {stock.map((item) => (
            <div key={item.id}>
              <label className="text-xs text-gray-500">{item.name}</label>
              <input
                type="number"
                min={0}
                className="mt-1 block w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                value={deliveryQty[item.id] ?? ""}
                onChange={(e) =>
                  setDeliveryQty((prev) => ({ ...prev, [item.id]: Number(e.target.value) || 0 }))
                }
              />
            </div>
          ))}
          <Button onClick={recordDelivery}>Evidentiraj isporuku</Button>
        </div>
      </div>
    </div>
  );
}
