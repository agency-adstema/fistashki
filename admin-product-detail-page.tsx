'use client';

import { useState, use, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, Tag, BarChart2, AlertTriangle,
  CheckCircle2, Loader2, Edit2, X, Save, Layers, Upload,
} from 'lucide-react';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/SkeletonCard';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { ProductStatus } from '@/types';

const STATUS_OPTIONS: ProductStatus[] = ['ACTIVE', 'DRAFT', 'ARCHIVED'];

const STATUS_STYLES: Record<ProductStatus, string> = {
  ACTIVE:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  DRAFT:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ARCHIVED: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};

function toSlug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700">
        <Icon className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0 dark:border-slate-700">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-sm text-slate-700 dark:text-slate-200 text-right">{value}</span>
    </div>
  );
}

function QuickEditPanel({ product }: { product: NonNullable<ReturnType<typeof useProduct>['data']> }) {
  const update = useUpdateProduct();
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [stock, setStock] = useState(String(product.stockQuantity));
  const [editingStock, setEditingStock] = useState(false);
  const [price, setPrice] = useState(String(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(String(product.compareAtPrice ?? ''));
  const [editingPrice, setEditingPrice] = useState(false);
  const [productName, setProductName] = useState(product.name);
  const [productSku, setProductSku] = useState(product.sku);
  const [productSlug, setProductSlug] = useState(product.slug);
  const [editingName, setEditingName] = useState(false);
  const [editingSku, setEditingSku] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [syncSlugWithName, setSyncSlugWithName] = useState(false);
  const [error, setError] = useState('');

  // Sync local state when product prop updates after re-fetch
  useEffect(() => {
    setStatus(product.status);
  }, [product.status]);

  useEffect(() => {
    setPrice(String(product.price));
    setCompareAtPrice(String(product.compareAtPrice ?? ''));
  }, [product.price, product.compareAtPrice]);

  useEffect(() => {
    setProductName(product.name);
    setProductSku(product.sku);
    setProductSlug(product.slug);
  }, [product.name, product.sku, product.slug]);

  async function saveStatus(newStatus: ProductStatus) {
    setError('');
    try {
      await update.mutateAsync({ id: product.id, payload: { status: newStatus } });
      setStatus(newStatus);
    } catch {
      setError('Failed to update status');
    }
  }

  async function saveStock(e: FormEvent) {
    e.preventDefault();
    const val = parseInt(stock, 10);
    if (isNaN(val) || val < 0) { setError('Invalid stock value'); return; }
    setError('');
    try {
      await update.mutateAsync({ id: product.id, payload: { stockQuantity: val } });
      setEditingStock(false);
    } catch {
      setError('Failed to update stock');
    }
  }

  async function toggleActive() {
    setError('');
    try {
      await update.mutateAsync({ id: product.id, payload: { isActive: !product.isActive } });
    } catch {
      setError('Failed to update visibility');
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Status selector */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Product Status</p>
        <div className="flex flex-col gap-1.5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => status !== s && saveStatus(s)}
              disabled={update.isPending}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition disabled:opacity-50 ${
                status === s
                  ? `${STATUS_STYLES[s]} border-current font-semibold`
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <span>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
              {status === s && <CheckCircle2 className="h-4 w-4" />}
              {update.isPending && status !== s && <Loader2 className="h-3.5 w-3.5 animate-spin opacity-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-600">
        <span className="text-sm text-slate-700 dark:text-slate-200">Visible in store</span>
        <button
          onClick={toggleActive}
          disabled={update.isPending}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
            product.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            product.isActive ? 'translate-x-4' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {/* Product name */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Naziv proizvoda</p>
          {!editingName && (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          )}
        </div>
        {editingName ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const n = productName.trim();
              if (!n) {
                setError('Naziv ne sme biti prazan');
                return;
              }
              setError('');
              try {
                const payload: { name: string; slug?: string } = { name: n };
                if (syncSlugWithName) {
                  const s = toSlug(n);
                  if (!s) {
                    setError('Naziv ne daje validan slug — koristi ručno polje „URL (slug)”');
                    return;
                  }
                  payload.slug = s;
                }
                await update.mutateAsync({ id: product.id, payload });
                setEditingName(false);
                setSyncSlugWithName(false);
              } catch {
                setError('Čuvanje naziva nije uspelo');
              }
            }}
          >
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white"
              placeholder="Naziv proizvoda"
              required
            />
            <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={syncSlugWithName}
                onChange={(e) => setSyncSlugWithName(e.target.checked)}
                className="mt-0.5 rounded border-slate-300"
              />
              <span>Ažuriraj i URL (slug) iz ovog naziva — bitno za SEO kada ispravljaš naziv</span>
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={update.isPending}
                className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Sačuvaj
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingName(false);
                  setProductName(product.name);
                  setSyncSlugWithName(false);
                  setError('');
                }}
                className="flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{product.name}</p>
        )}
      </div>

      {/* Slug / URL za prodavnicu */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">URL (slug) · SEO</p>
          {!editingSlug && (
            <button
              type="button"
              onClick={() => setEditingSlug(true)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          )}
        </div>
        {editingSlug ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const raw = productSlug.trim();
              const s = toSlug(raw);
              if (!s) {
                setError('Slug ne sme biti prazan');
                return;
              }
              setError('');
              try {
                await update.mutateAsync({ id: product.id, payload: { slug: s } });
                setProductSlug(s);
                setEditingSlug(false);
              } catch {
                setError('Čuvanje slug-a nije uspelo (proveri da li već postoji isti URL)');
              }
            }}
          >
            <input
              value={productSlug}
              onChange={(e) => setProductSlug(e.target.value)}
              className="h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white"
              placeholder="npr. agro-verm-k-0-5l"
              required
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sačuvano: <span className="font-mono">{toSlug(productSlug.trim()) || '—'}</span> · u prodavnici /product/…
            </p>
            <button
              type="button"
              onClick={() => setProductSlug(toSlug(product.name))}
              className="self-start text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Predloži iz trenutnog naziva
            </button>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={update.isPending}
                className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Sačuvaj slug
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingSlug(false);
                  setProductSlug(product.slug);
                  setError('');
                }}
                className="flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <p className="break-all font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{product.slug}</p>
        )}
      </div>

      {/* SKU */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">SKU</p>
          {!editingSku && (
            <button
              type="button"
              onClick={() => setEditingSku(true)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          )}
        </div>
        {editingSku ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const s = productSku.trim();
              if (!s) {
                setError('SKU ne sme biti prazan');
                return;
              }
              setError('');
              try {
                await update.mutateAsync({ id: product.id, payload: { sku: s } });
                setEditingSku(false);
              } catch {
                setError('Čuvanje SKU nije uspelo (možda već postoji isti SKU)');
              }
            }}
          >
            <input
              value={productSku}
              onChange={(e) => setProductSku(e.target.value)}
              className="h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white"
              placeholder="SKU"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={update.isPending}
                className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Sačuvaj
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingSku(false);
                  setProductSku(product.sku);
                  setError('');
                }}
                className="flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">{product.sku}</p>
        )}
      </div>

      {/* Price editor */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cena ({product.currency || 'RSD'})</p>
          {!editingPrice && (
            <button
              onClick={() => setEditingPrice(true)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
          )}
        </div>
        {editingPrice ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const p = parseFloat(price);
              if (isNaN(p) || p <= 0) { setError('Cena mora biti pozitivan broj'); return; }
              setError('');
              try {
                await update.mutateAsync({
                  id: product.id,
                  payload: {
                    price: p,
                    compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
                  },
                });
                setEditingPrice(false);
              } catch {
                setError('Čuvanje cene nije uspelo');
              }
            }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {product.currency || 'RSD'}
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-8 w-full rounded-lg border border-indigo-400 bg-white pl-10 pr-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white"
                  placeholder="Cena"
                  required
                />
              </div>
              <button type="submit" disabled={update.isPending}
                className="flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white disabled:opacity-50">
                {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </button>
              <button type="button" onClick={() => { setEditingPrice(false); setPrice(String(product.price)); setCompareAtPrice(String(product.compareAtPrice ?? '')); setError(''); }}
                className="flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {product.currency || 'RSD'}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Stara cena (opciono)"
              />
            </div>
          </form>
        ) : (
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {formatCurrency(product.price, product.currency)}
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span className="ml-2 text-xs font-normal text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stock editor */}
      {product.trackQuantity && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stock Quantity</p>
            {!editingStock && (
              <button
                onClick={() => setEditingStock(true)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <Edit2 className="h-3 w-3" /> Edit
              </button>
            )}
          </div>
          {editingStock ? (
            <form onSubmit={saveStock} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white"
              />
              <button type="submit" disabled={update.isPending}
                className="flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white disabled:opacity-50">
                {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </button>
              <button type="button" onClick={() => { setEditingStock(false); setStock(String(product.stockQuantity)); }}
                className="flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${
              product.stockQuantity === 0 ? 'text-red-600 dark:text-red-400' :
              product.stockQuantity <= product.lowStockThreshold ? 'text-amber-600 dark:text-amber-400' :
              'text-slate-700 dark:text-slate-200'
            }`}>
              {product.stockQuantity === 0 || product.stockQuantity <= product.lowStockThreshold
                ? <AlertTriangle className="h-4 w-4" />
                : null}
              {product.stockQuantity} units
              {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
                <span className="text-xs font-normal text-amber-500 dark:text-amber-400">— low stock</span>
              )}
              {product.stockQuantity === 0 && (
                <span className="text-xs font-normal text-red-500 dark:text-red-400">— out of stock</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryEditSection({ product }: { product: NonNullable<ReturnType<typeof useProduct>['data']> }) {
  const update = useUpdateProduct();
  const { data: categoriesData } = useCategories();
  const [editMode, setEditMode] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product.productCategories?.map((pc) => pc.categoryId) ?? []
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = categoriesData ? (Array.isArray(categoriesData) ? categoriesData : categoriesData.items) : [];

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await update.mutateAsync({ id: product.id, payload: { categoryIds: selectedCategoryIds } });
      setEditMode(false);
    } catch {
      setError('Failed to update categories');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditMode(false);
    setSelectedCategoryIds(product.productCategories?.map((pc) => pc.categoryId) ?? []);
    setError('');
  }

  if (editMode) {
    return (
      <div className="space-y-3">
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="space-y-2">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                    } else {
                      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== cat.id));
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">{cat.name}</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-slate-400">No categories available</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between">
      <div>
        {product.productCategories?.length ? (
          <div className="flex flex-wrap gap-2">
            {product.productCategories.map((pc) => (
              <span key={pc.categoryId}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                {pc.category.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No categories assigned</p>
        )}
      </div>
      <button
        onClick={() => setEditMode(true)}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
      >
        <Edit2 className="h-3 w-3" /> Edit
      </button>
    </div>
  );
}

function ProductImageEditor({ product }: { product: NonNullable<ReturnType<typeof useProduct>['data']> }) {
  const update = useUpdateProduct();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const preview = primary?.url ?? product.featuredImage ?? '';

  async function onFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setErr('Dozvoljene su samo slike (JPG, PNG, WEBP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('Slika mora biti manja od 5MB');
      return;
    }
    setErr('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: body } = await api.post<{ success?: boolean; data?: { url?: string } }>(
        '/upload/image',
        formData,
      );
      const url = body?.data?.url;
      if (!url) throw new Error('Server nije vratio URL slike');
      await update.mutateAsync({
        id: product.id,
        payload: {
          featuredImage: url,
          images: [
            {
              url,
              altText: product.name,
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        },
      });
    } catch (e: unknown) {
      const data = (e as { response?: { data?: { message?: unknown; errors?: string[] } } })?.response?.data;
      const m = data?.message;
      const errList = data?.errors?.length ? data.errors.join('; ') : '';
      setErr(
        errList ||
          (typeof m === 'string'
            ? m
            : Array.isArray(m)
              ? m.join('; ')
              : 'Otpremanje nije uspelo. Pokušaj ponovo.'),
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative flex h-40 w-40 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40">
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="px-2 text-center text-xs text-slate-400">Nema slike</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={uploading || update.isPending}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {uploading || update.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading || update.isPending ? 'Čuvanje...' : 'Otpremi ili zameni sliku'}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            JPG, PNG, WEBP ili GIF · najviše 5MB. Ovo postavlja glavnu sliku u prodavnici.
          </p>
        </div>
      </div>
    </div>
  );
}

const ta = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 resize-none';
const inp2 = 'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200';

function ProductDetailsEditor({ product }: { product: NonNullable<ReturnType<typeof useProduct>['data']> }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    benefits: product.benefits ?? '',
    howToUse: product.howToUse ?? '',
    composition: product.composition ?? '',
    bestSeason: product.bestSeason ?? '',
    suitablePlants: product.suitablePlants ?? '',
    seoTitle: product.seoTitle ?? '',
    seoDescription: product.seoDescription ?? '',
    aiCallScript: (product as any).aiCallScript ?? '',
  });

  useEffect(() => {
    setForm({
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      benefits: product.benefits ?? '',
      howToUse: product.howToUse ?? '',
      composition: product.composition ?? '',
      bestSeason: product.bestSeason ?? '',
      suitablePlants: product.suitablePlants ?? '',
      seoTitle: product.seoTitle ?? '',
      seoDescription: product.seoDescription ?? '',
      aiCallScript: (product as any).aiCallScript ?? '',
    });
  }, [product]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        shortDescription: form.shortDescription,
        description: form.description,
        benefits: form.benefits,
        howToUse: form.howToUse,
        composition: form.composition,
        bestSeason: form.bestSeason,
        suitablePlants: form.suitablePlants,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        aiCallScript: form.aiCallScript,
      };
      // Direktan PATCH — izbegava hook koji ponekad šalje pogrešno telo ({ payload } ili spread celog product-a).
      const { data: body } = await api.patch<{
        success?: boolean;
        message?: string;
        data?: NonNullable<ReturnType<typeof useProduct>['data']>;
      }>(`/products/${product.id}`, payload);

      const updated =
        body && typeof body === 'object' && 'data' in body && body.data != null
          ? body.data
          : null;

      if (!updated) {
        setError('Server nije vratio ažuriran proizvod. Proveri API odgovor.');
        return;
      }

      for (const key of [
        ['products', product.id],
        ['admin', 'product', product.id],
        ['product', product.id],
      ] as const) {
        queryClient.setQueryData(key, updated);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);

      setEditing(false);
    } catch (err: unknown) {
      const d = (err as { response?: { data?: { message?: string | string[]; errors?: string[] } } })?.response?.data;
      const fromErrors = d?.errors?.length ? d.errors.join('; ') : '';
      const m = d?.message;
      const fromMessage = Array.isArray(m) ? m.join('; ') : (typeof m === 'string' ? m : '');
      setError(fromErrors || fromMessage || 'Čuvanje nije uspelo. Pokušaj ponovo.');
    } finally {
      setSaving(false);
    }
  }

  const hasData =
    form.shortDescription ||
    form.description ||
    form.benefits ||
    form.howToUse ||
    form.composition ||
    form.bestSeason ||
    form.suitablePlants ||
    form.aiCallScript;

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        </div>
        {!hasData && (
          <p className="text-sm text-slate-400 italic">Nema unetih detalja. Klikni Edit da dodaš.</p>
        )}
        {form.shortDescription && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kratki opis</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{form.shortDescription}</p>
          </div>
        )}
        {form.description && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Opis</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{form.description}</p>
          </div>
        )}
        {form.benefits && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prednosti</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{form.benefits}</p>
          </div>
        )}
        {form.howToUse && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kako Koristiti</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{form.howToUse}</p>
          </div>
        )}
        {form.composition && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sastav</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{form.composition}</p>
          </div>
        )}
        {form.bestSeason && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Najbolja Sezona</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{form.bestSeason}</p>
          </div>
        )}
        {form.suitablePlants && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pogodne Biljke</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{form.suitablePlants}</p>
          </div>
        )}
        {form.seoTitle && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO Title</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{form.seoTitle}</p>
          </div>
        )}
        {form.seoDescription && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO Description</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{form.seoDescription}</p>
          </div>
        )}
        {form.aiCallScript ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/40 dark:bg-blue-900/10">
            <p className="mb-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wide dark:text-blue-400">🤖 AI Call Script</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{form.aiCallScript}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800/30">
            <p className="text-xs text-blue-500 dark:text-blue-400">🤖 Nema AI Call Script-a — klikni <strong>Edit</strong> da dodaš šta Ivana govori o ovom proizvodu</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Kratki opis / Short description</label>
        <textarea
          rows={2}
          className={ta}
          placeholder="Kratko objašnjenje za listu proizvoda i kartice (1–2 rečenice)…"
          value={form.shortDescription}
          onChange={(e) => set({ shortDescription: e.target.value })}
        />
        <p className="mt-1 text-xs text-slate-400">Prikazuje se iznad dugog opisa u prodavnici gde je predviđeno.</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Opis / Description</label>
        <textarea rows={4} className={ta} placeholder="Opis proizvoda..." value={form.description} onChange={(e) => set({ description: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Prednosti / Benefits</label>
        <textarea rows={3} className={ta} placeholder="Prednosti i karakteristike proizvoda..." value={form.benefits} onChange={(e) => set({ benefits: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Kako Koristiti / How to Use</label>
        <textarea rows={3} className={ta} placeholder="Uputstvo za upotrebu..." value={form.howToUse} onChange={(e) => set({ howToUse: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Sastav / Composition</label>
        <textarea rows={3} className={ta} placeholder="Sastav i sastojci..." value={form.composition} onChange={(e) => set({ composition: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Najbolja Sezona / Best Season</label>
          <input className={inp2} placeholder="npr. Proleće, Leto, Cela godina..." value={form.bestSeason} onChange={(e) => set({ bestSeason: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Pogodne Biljke / Suitable Plants</label>
          <input className={inp2} placeholder="npr. Povrće, Voće, Cveće..." value={form.suitablePlants} onChange={(e) => set({ suitablePlants: e.target.value })} />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">SEO Settings</h4>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO Title</label>
        <input className={inp2} placeholder="SEO Title (60 characters max)" value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value.slice(0, 60) })} maxLength={60} />
        <p className="mt-1 text-xs text-slate-400">{form.seoTitle.length}/60 characters</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO Description</label>
        <textarea rows={2} className={ta} placeholder="SEO Description (160 characters max)" value={form.seoDescription} onChange={(e) => set({ seoDescription: e.target.value.slice(0, 160) })} maxLength={160} />
        <p className="mt-1 text-xs text-slate-400">{form.seoDescription.length}/160 characters</p>
      </div>

      <div className="border-t border-blue-100 pt-4 dark:border-blue-800/30">
        <label className="mb-1 block text-xs font-semibold text-blue-600 uppercase tracking-wide dark:text-blue-400">🤖 AI Call Script</label>
        <textarea
          rows={6}
          className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/20 dark:border-blue-800/40 dark:bg-blue-900/10 dark:text-slate-200 resize-none"
          placeholder={`Šta Ivana govori o ovom proizvodu?\n\nPrimer za preparat:\nOvaj preparat pomaže kod problema sa prostatom. Uzima se 2 kapsule dnevno uz obrok. Rezultati se osećaju posle 3-4 nedelje redovne upotrebe. Prirodni su sastojci, bez kontraindikacija.\n\nPrimer za elektroniku:\nErgonomski miš sa 6 dugmadi i 3200 DPI. Plug & play, nema potrebe za drajverima. Radi na Windows i Mac. Kabel 1.8m.`}
          value={form.aiCallScript}
          onChange={(e) => set({ aiCallScript: e.target.value })}
        />
        <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">Ivana koristi ovaj tekst kada zove kupce koji su poručili ovaj proizvod</p>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Sačuvaj
        </button>
        <button type="button" onClick={() => { setEditing(false); setError(''); }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
          <X className="h-3.5 w-3.5" />
          Otkaži
        </button>
      </div>
    </form>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);
  const deleteProduct = useDeleteProduct();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertTriangle className="h-10 w-10 text-amber-400" />
        <p className="text-slate-500">Product not found or failed to load.</p>
        <Link href="/products" className="text-sm text-indigo-600 hover:underline">← Back to Products</Link>
      </div>
    );
  }

  const primaryImage = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  // Featured image fallback when no images[] are uploaded
  const displayImage = primaryImage?.url ?? product.featuredImage ?? null;
  const categories = product.productCategories?.map((pc) => pc.category.name).join(', ') || '—';

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Products
      </Link>

      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          {/* Image */}
          <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700">
            {displayImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={displayImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{product.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[product.status]}`}>
                {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
              </span>
              {!product.isActive && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  Hidden from store
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-mono text-xs">SKU: {product.sku}</span>
              <span>Slug: <span className="font-mono text-xs">{product.slug}</span></span>
              <span>Updated: {formatDateTime(product.updatedAt)}</span>
            </div>
            {product.shortDescription && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{product.shortDescription}</p>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => setDeleteModal(true)}
            className="flex h-9 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: info cards */}
        <div className="space-y-4 lg:col-span-2">

          {/* Pricing */}
          <SectionCard title="Pricing" icon={Tag}>
            <InfoRow label="Price" value={<span className="font-semibold">{formatCurrency(product.price, product.currency)}</span>} />
            {product.compareAtPrice != null && (
              <InfoRow label="Compare at price" value={
                <span className={product.compareAtPrice > product.price ? 'text-slate-400 line-through' : ''}>
                  {formatCurrency(product.compareAtPrice, product.currency)}
                </span>
              } />
            )}
            {product.costPrice != null && (
              <InfoRow label="Cost price" value={formatCurrency(product.costPrice, product.currency)} />
            )}
            <InfoRow label="Currency" value={product.currency} />
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <InfoRow label="Discount" value={
                <span className="text-emerald-600 font-semibold dark:text-emerald-400">
                  {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
                </span>
              } />
            )}
          </SectionCard>

          {/* Inventory */}
          <SectionCard title="Inventory" icon={BarChart2}>
            <InfoRow label="Track quantity" value={product.trackQuantity ? 'Yes' : 'No'} />
            {product.trackQuantity && (
              <>
                <InfoRow label="Stock quantity" value={
                  <span className={
                    product.stockQuantity === 0 ? 'text-red-600 font-semibold dark:text-red-400' :
                    product.stockQuantity <= product.lowStockThreshold ? 'text-amber-600 font-semibold dark:text-amber-400' :
                    'font-semibold'
                  }>{product.stockQuantity} units</span>
                } />
                <InfoRow label="Low stock threshold" value={`${product.lowStockThreshold} units`} />
              </>
            )}
            <InfoRow label="In stock" value={
              product.inStock
                ? <span className="text-emerald-600 dark:text-emerald-400">Yes</span>
                : <span className="text-red-600 dark:text-red-400">No</span>
            } />
          </SectionCard>

          {/* Categories */}
          <SectionCard title="Categories" icon={Layers}>
            <CategoryEditSection product={product} />
          </SectionCard>

          <SectionCard title="Glavna slika proizvoda" icon={Package}>
            <ProductImageEditor product={product} />
          </SectionCard>

          {/* Image gallery */}
          {product.images && product.images.length > 0 && (
            <SectionCard title={`Images (${product.images.length})`} icon={Package}>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {product.images.map((img) => (
                  <div key={img.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.altText ?? product.name} className="h-full w-full object-cover" />
                    {img.isPrimary && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-xs text-white">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Description */}
          <SectionCard title="Opis / Description" icon={Package}>
            <ProductDetailsEditor product={product} />
          </SectionCard>

        </div>

        {/* Right: quick edit */}
        <div className="space-y-4">
          <SectionCard title="Quick Edit" icon={Edit2}>
            <QuickEditPanel product={product} />
          </SectionCard>

          {/* SEO */}
          {(product.seoTitle || product.seoDescription) && (
            <SectionCard title="SEO" icon={Tag}>
              {product.seoTitle && <InfoRow label="SEO title" value={product.seoTitle} />}
              {product.seoDescription && <InfoRow label="SEO description" value={product.seoDescription} />}
            </SectionCard>
          )}

          {/* Meta */}
          <SectionCard title="Details" icon={CheckCircle2}>
            <InfoRow label="Created" value={formatDateTime(product.createdAt)} />
            <InfoRow label="Updated" value={formatDateTime(product.updatedAt)} />
            <InfoRow label="Category" value={categories} />
          </SectionCard>
        </div>
      </div>

      {/* Delete modal */}
      <Modal open={deleteModal} title="Delete product?" onClose={() => { setDeleteModal(false); setDeleteError(''); }}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3 dark:bg-red-900/10">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">This action is permanent</p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                Deleting <strong>{product.name}</strong> cannot be undone. Any orders referencing this product will retain historical data.
              </p>
            </div>
          </div>
          {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => { setDeleteModal(false); setDeleteError(''); }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
              Cancel
            </button>
            <button
              disabled={deleteProduct.isPending}
              onClick={async () => {
                setDeleteError('');
                try {
                  await deleteProduct.mutateAsync(product.id);
                  router.push('/products');
                } catch {
                  setDeleteError('Failed to delete product. It may be referenced in existing orders.');
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {deleteProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete product
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
