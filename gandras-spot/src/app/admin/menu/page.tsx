"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  menuApi,
  type AdminMenuData,
  type MenuItemInput,
  type MenuItemRecord,
  type MenuItemType,
} from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ProductCategorySlug = "burgers" | "sandwiches" | "lepinje" | "pomfrit";

type Section =
  | {
      kind: "product";
      key: ProductCategorySlug;
      title: string;
      items: MenuItemRecord[];
    }
  | {
      kind: "addon";
      key: Exclude<MenuItemType, "burger">;
      title: string;
      items: MenuItemRecord[];
    };

const PRODUCT_CATEGORIES: { slug: ProductCategorySlug; title: string }[] = [
  { slug: "burgers", title: "Burgeri" },
  { slug: "sandwiches", title: "Sendviči" },
  { slug: "lepinje", title: "Kompleks lepinje" },
  { slug: "pomfrit", title: "Pomfrit" },
];

function ItemModal({
  open,
  title,
  initial,
  defaultCategorySlug,
  showCategory,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  initial?: MenuItemRecord;
  defaultCategorySlug?: ProductCategorySlug;
  showCategory?: boolean;
  onClose: () => void;
  onSave: (data: MenuItemInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [categorySlug, setCategorySlug] = useState<ProductCategorySlug>("burgers");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setPrice(initial?.price ?? 0);
    setDescription(initial?.description ?? "");
    setImageUrl(initial?.imageUrl ?? null);
    const cat = (initial?.categorySlug ?? defaultCategorySlug ?? "burgers") as ProductCategorySlug;
    setCategorySlug(
      PRODUCT_CATEGORIES.some((c) => c.slug === cat) ? cat : "burgers",
    );
    setError("");
  }, [open, initial, defaultCategorySlug]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-black">{title}</h2>
        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Slika</p>
            <div className="flex items-center gap-3">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="px-2 text-center text-[10px] text-gray-400">Nema slike</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setUploading(true);
                    setError("");
                    try {
                      const { url } = await menuApi.uploadImage(file);
                      setImageUrl(url);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Greška pri uploadu");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? "Upload..." : "Upload slike"}
                </Button>
                {imageUrl && (
                  <button
                    type="button"
                    className="text-left text-xs text-gray-400 hover:text-red-500"
                    onClick={() => setImageUrl(null)}
                  >
                    Ukloni sliku
                  </button>
                )}
              </div>
            </div>
          </div>

          {showCategory && (
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value as ProductCategorySlug)}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
            placeholder="Naziv"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
            placeholder="Cena (RSD)"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <textarea
            className="w-full rounded-xl border border-gray-200 px-3 py-2"
            placeholder={
              "Sastav / normativ (svaka stavka u novom redu)\nŠunka 100 g\nSir\nLepinja / hleb"
            }
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-gray-400">
            Ovo se prikazuje kupcima na shopu kao „Normativ / sastav“. Svaki sastojak u novom redu.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
          <Button
            disabled={!name.trim() || saving || uploading}
            onClick={async () => {
              setSaving(true);
              setError("");
              try {
                await onSave({
                  name: name.trim(),
                  price,
                  description: description || undefined,
                  imageUrl,
                  categorySlug: showCategory ? categorySlug : undefined,
                });
                onClose();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Greška pri čuvanju");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Čuvam..." : "Sačuvaj"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<AdminMenuData | null>(null);
  const [modal, setModal] = useState<{
    section: Section;
    item?: MenuItemRecord;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    menuApi.admin().then(setMenu).catch(console.error);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sections: Section[] = useMemo(() => {
    if (!menu) return [];
    const productSections: Section[] = PRODUCT_CATEGORIES.map((c) => ({
      kind: "product",
      key: c.slug,
      title: c.title,
      items: menu.products.filter((p) => (p.categorySlug ?? "burgers") === c.slug),
    }));
    return [
      ...productSections,
      { kind: "addon", key: "ingredient", title: "Salate", items: menu.ingredients },
      { kind: "addon", key: "extra", title: "Dodaci", items: menu.extras },
      { kind: "addon", key: "drink", title: "Pića", items: menu.drinks },
    ];
  }, [menu]);

  const handleSave = async (data: MenuItemInput) => {
    if (!modal) return;
    const { section, item } = modal;
    if (section.kind === "product") {
      const payload: MenuItemInput = {
        ...data,
        categorySlug: data.categorySlug ?? section.key,
      };
      if (item) await menuApi.update("burger", item.id, payload);
      else await menuApi.create("burger", payload);
    } else {
      if (item) await menuApi.update(section.key, item.id, data);
      else await menuApi.create(section.key, data);
    }
    load();
  };

  const handleDelete = async (section: Section, item: MenuItemRecord) => {
    if (!window.confirm(`Obrisati „${item.name}“? Nestaje i sa shopa.`)) return;
    setDeletingId(item.id);
    try {
      const type: MenuItemType = section.kind === "product" ? "burger" : section.key;
      await menuApi.remove(type, item.id);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Greška pri brisanju");
    } finally {
      setDeletingId(null);
    }
  };

  if (!menu) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Učitavanje...</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black">Meni</h1>
      <p className="text-gray-500">
        Izmene ovde (naziv, cena, sastav, slika) odmah se prikazuju na shopu
      </p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <div key={`${section.kind}-${section.key}`} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-black">{section.title}</h2>
              <button
                type="button"
                onClick={() => setModal({ section })}
                className="rounded-full bg-[#F6A300] px-4 py-1.5 text-sm font-bold text-black"
              >
                + Dodaj
              </button>
            </div>
            <ul className="mt-4 divide-y divide-gray-50">
              {section.items.length === 0 && (
                <li className="py-4 text-sm text-gray-400">Nema stavki — dodaj novi proizvod.</li>
              )}
              {section.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] text-gray-300">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      {item.description && (
                        <p className="line-clamp-2 whitespace-pre-line text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}
                      {!item.isAvailable && (
                        <p className="text-xs font-medium text-amber-600">Nedostupno</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <span className="font-bold">{formatPrice(item.price)}</span>
                    <button
                      type="button"
                      className="text-sm text-gray-400 hover:text-[#F6A300]"
                      onClick={() => setModal({ section, item })}
                    >
                      Izmeni
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      className="text-sm text-gray-400 hover:text-red-500 disabled:opacity-50"
                      onClick={() => handleDelete(section, item)}
                    >
                      {deletingId === item.id ? "..." : "Obriši"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ItemModal
        open={Boolean(modal)}
        title={
          modal?.item
            ? `Izmeni — ${modal.section.title}`
            : `Dodaj — ${modal?.section.title ?? ""}`
        }
        initial={modal?.item}
        showCategory={modal?.section.kind === "product"}
        defaultCategorySlug={
          modal?.section.kind === "product" ? modal.section.key : undefined
        }
        onClose={() => setModal(null)}
        onSave={handleSave}
      />
    </div>
  );
}
