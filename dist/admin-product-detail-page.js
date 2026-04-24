'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProductDetailPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const api_1 = __importDefault(require("@/lib/api"));
const react_query_1 = require("@tanstack/react-query");
const useProducts_1 = require("@/hooks/useProducts");
const useCategories_1 = require("@/hooks/useCategories");
const Modal_1 = require("@/components/ui/Modal");
const SkeletonCard_1 = require("@/components/ui/SkeletonCard");
const utils_1 = require("@/lib/utils");
const STATUS_OPTIONS = ['ACTIVE', 'DRAFT', 'ARCHIVED'];
const STATUS_STYLES = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ARCHIVED: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};
function toSlug(s) {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
function SectionCard({ title, icon: Icon, children }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-700", children: [(0, jsx_runtime_1.jsx)(Icon, { className: "h-4 w-4 text-slate-400" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-semibold text-slate-700 dark:text-slate-200", children: title })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-5", children: children })] }));
}
function InfoRow({ label, value }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0 dark:border-slate-700", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0", children: label }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-slate-700 dark:text-slate-200 text-right", children: value })] }));
}
function QuickEditPanel({ product }) {
    const update = (0, useProducts_1.useUpdateProduct)();
    const [status, setStatus] = (0, react_1.useState)(product.status);
    const [stock, setStock] = (0, react_1.useState)(String(product.stockQuantity));
    const [editingStock, setEditingStock] = (0, react_1.useState)(false);
    const [price, setPrice] = (0, react_1.useState)(String(product.price));
    const [compareAtPrice, setCompareAtPrice] = (0, react_1.useState)(String(product.compareAtPrice ?? ''));
    const [editingPrice, setEditingPrice] = (0, react_1.useState)(false);
    const [productName, setProductName] = (0, react_1.useState)(product.name);
    const [productSku, setProductSku] = (0, react_1.useState)(product.sku);
    const [productSlug, setProductSlug] = (0, react_1.useState)(product.slug);
    const [editingName, setEditingName] = (0, react_1.useState)(false);
    const [editingSku, setEditingSku] = (0, react_1.useState)(false);
    const [editingSlug, setEditingSlug] = (0, react_1.useState)(false);
    const [syncSlugWithName, setSyncSlugWithName] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        setStatus(product.status);
    }, [product.status]);
    (0, react_1.useEffect)(() => {
        setPrice(String(product.price));
        setCompareAtPrice(String(product.compareAtPrice ?? ''));
    }, [product.price, product.compareAtPrice]);
    (0, react_1.useEffect)(() => {
        setProductName(product.name);
        setProductSku(product.sku);
        setProductSlug(product.slug);
    }, [product.name, product.sku, product.slug]);
    async function saveStatus(newStatus) {
        setError('');
        try {
            await update.mutateAsync({ id: product.id, payload: { status: newStatus } });
            setStatus(newStatus);
        }
        catch {
            setError('Failed to update status');
        }
    }
    async function saveStock(e) {
        e.preventDefault();
        const val = parseInt(stock, 10);
        if (isNaN(val) || val < 0) {
            setError('Invalid stock value');
            return;
        }
        setError('');
        try {
            await update.mutateAsync({ id: product.id, payload: { stockQuantity: val } });
            setEditingStock(false);
        }
        catch {
            setError('Failed to update stock');
        }
    }
    async function toggleActive() {
        setError('');
        try {
            await update.mutateAsync({ id: product.id, payload: { isActive: !product.isActive } });
        }
        catch {
            setError('Failed to update visibility');
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [error && (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-500", children: error }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-2 text-xs font-medium text-slate-500 dark:text-slate-400", children: "Product Status" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col gap-1.5", children: STATUS_OPTIONS.map((s) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => status !== s && saveStatus(s), disabled: update.isPending, className: `flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition disabled:opacity-50 ${status === s
                                ? `${STATUS_STYLES[s]} border-current font-semibold`
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'}`, children: [(0, jsx_runtime_1.jsx)("span", { children: s.charAt(0) + s.slice(1).toLowerCase() }), status === s && (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }), update.isPending && status !== s && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin opacity-0" })] }, s))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-600", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-slate-700 dark:text-slate-200", children: "Visible in store" }), (0, jsx_runtime_1.jsx)("button", { onClick: toggleActive, disabled: update.isPending, className: `relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${product.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`, children: (0, jsx_runtime_1.jsx)("span", { className: `inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${product.isActive ? 'translate-x-4' : 'translate-x-0.5'}` }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-1.5 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400", children: "Naziv proizvoda" }), !editingName && ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setEditingName(true), className: "flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3 w-3" }), " Edit"] }))] }), editingName ? ((0, jsx_runtime_1.jsxs)("form", { className: "flex flex-col gap-2", onSubmit: async (e) => {
                            e.preventDefault();
                            const n = productName.trim();
                            if (!n) {
                                setError('Naziv ne sme biti prazan');
                                return;
                            }
                            setError('');
                            try {
                                const payload = { name: n };
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
                            }
                            catch {
                                setError('Čuvanje naziva nije uspelo');
                            }
                        }, children: [(0, jsx_runtime_1.jsx)("input", { value: productName, onChange: (e) => setProductName(e.target.value), className: "h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white", placeholder: "Naziv proizvoda", required: true }), (0, jsx_runtime_1.jsxs)("label", { className: "flex cursor-pointer items-start gap-2 text-xs text-slate-600 dark:text-slate-400", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: syncSlugWithName, onChange: (e) => setSyncSlugWithName(e.target.checked), className: "mt-0.5 rounded border-slate-300" }), (0, jsx_runtime_1.jsx)("span", { children: "A\u017Euriraj i URL (slug) iz ovog naziva \u2014 bitno za SEO kada ispravlja\u0161 naziv" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: update.isPending, className: "flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white disabled:opacity-50", children: [update.isPending ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3.5 w-3.5" }), "Sa\u010Duvaj"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                            setEditingName(false);
                                            setProductName(product.name);
                                            setSyncSlugWithName(false);
                                            setError('');
                                        }, className: "flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5" }) })] })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-700 dark:text-slate-200", children: product.name }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-1.5 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400", children: "URL (slug) \u00B7 SEO" }), !editingSlug && ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setEditingSlug(true), className: "flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3 w-3" }), " Edit"] }))] }), editingSlug ? ((0, jsx_runtime_1.jsxs)("form", { className: "flex flex-col gap-2", onSubmit: async (e) => {
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
                            }
                            catch {
                                setError('Čuvanje slug-a nije uspelo (proveri da li već postoji isti URL)');
                            }
                        }, children: [(0, jsx_runtime_1.jsx)("input", { value: productSlug, onChange: (e) => setProductSlug(e.target.value), className: "h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white", placeholder: "npr. agro-verm-k-0-5l", required: true }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[11px] text-slate-500 dark:text-slate-400", children: ["Sa\u010Duvano: ", (0, jsx_runtime_1.jsx)("span", { className: "font-mono", children: toSlug(productSlug.trim()) || '—' }), " \u00B7 u prodavnici /product/\u2026"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setProductSlug(toSlug(product.name)), className: "self-start text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400", children: "Predlo\u017Ei iz trenutnog naziva" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: update.isPending, className: "flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white disabled:opacity-50", children: [update.isPending ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3.5 w-3.5" }), "Sa\u010Duvaj slug"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                            setEditingSlug(false);
                                            setProductSlug(product.slug);
                                            setError('');
                                        }, className: "flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5" }) })] })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "break-all font-mono text-sm font-semibold text-slate-700 dark:text-slate-200", children: product.slug }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-1.5 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400", children: "SKU" }), !editingSku && ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setEditingSku(true), className: "flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3 w-3" }), " Edit"] }))] }), editingSku ? ((0, jsx_runtime_1.jsxs)("form", { className: "flex flex-col gap-2", onSubmit: async (e) => {
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
                            }
                            catch {
                                setError('Čuvanje SKU nije uspelo (možda već postoji isti SKU)');
                            }
                        }, children: [(0, jsx_runtime_1.jsx)("input", { value: productSku, onChange: (e) => setProductSku(e.target.value), className: "h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white", placeholder: "SKU", required: true }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: update.isPending, className: "flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white disabled:opacity-50", children: [update.isPending ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3.5 w-3.5" }), "Sa\u010Duvaj"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                            setEditingSku(false);
                                            setProductSku(product.sku);
                                            setError('');
                                        }, className: "flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5" }) })] })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "font-mono text-sm font-semibold text-slate-700 dark:text-slate-200", children: product.sku }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-1.5 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400", children: ["Cena (", product.currency || 'RSD', ")"] }), !editingPrice && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setEditingPrice(true), className: "flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3 w-3" }), " Edit"] }))] }), editingPrice ? ((0, jsx_runtime_1.jsxs)("form", { onSubmit: async (e) => {
                            e.preventDefault();
                            const p = parseFloat(price);
                            if (isNaN(p) || p <= 0) {
                                setError('Cena mora biti pozitivan broj');
                                return;
                            }
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
                            }
                            catch {
                                setError('Čuvanje cene nije uspelo');
                            }
                        }, className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400", children: product.currency || 'RSD' }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0.01", step: "0.01", value: price, onChange: (e) => setPrice(e.target.value), className: "h-8 w-full rounded-lg border border-indigo-400 bg-white pl-10 pr-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white", placeholder: "Cena", required: true })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: update.isPending, className: "flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white disabled:opacity-50", children: update.isPending ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3.5 w-3.5" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setEditingPrice(false); setPrice(String(product.price)); setCompareAtPrice(String(product.compareAtPrice ?? '')); setError(''); }, className: "flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("span", { className: "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400", children: product.currency || 'RSD' }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", step: "0.01", value: compareAtPrice, onChange: (e) => setCompareAtPrice(e.target.value), className: "h-8 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white", placeholder: "Stara cena (opciono)" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "text-sm font-semibold text-slate-700 dark:text-slate-200", children: [(0, utils_1.formatCurrency)(product.price, product.currency), product.compareAtPrice != null && product.compareAtPrice > product.price && ((0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-xs font-normal text-slate-400 line-through", children: (0, utils_1.formatCurrency)(product.compareAtPrice, product.currency) }))] }))] }), product.trackQuantity && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-1.5", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400", children: "Stock Quantity" }), !editingStock && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setEditingStock(true), className: "flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3 w-3" }), " Edit"] }))] }), editingStock ? ((0, jsx_runtime_1.jsxs)("form", { onSubmit: saveStock, className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", value: stock, onChange: (e) => setStock(e.target.value), className: "h-8 w-full rounded-lg border border-indigo-400 bg-white px-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400/20 dark:bg-slate-700 dark:text-white" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: update.isPending, className: "flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white disabled:opacity-50", children: update.isPending ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3.5 w-3.5" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { setEditingStock(false); setStock(String(product.stockQuantity)); }, className: "flex h-8 items-center rounded-lg border border-slate-200 px-2 text-slate-500 hover:bg-slate-50 dark:border-slate-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5" }) })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center gap-1.5 text-sm font-semibold ${product.stockQuantity === 0 ? 'text-red-600 dark:text-red-400' :
                            product.stockQuantity <= product.lowStockThreshold ? 'text-amber-600 dark:text-amber-400' :
                                'text-slate-700 dark:text-slate-200'}`, children: [product.stockQuantity === 0 || product.stockQuantity <= product.lowStockThreshold
                                ? (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4" })
                                : null, product.stockQuantity, " units", product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs font-normal text-amber-500 dark:text-amber-400", children: "\u2014 low stock" })), product.stockQuantity === 0 && ((0, jsx_runtime_1.jsx)("span", { className: "text-xs font-normal text-red-500 dark:text-red-400", children: "\u2014 out of stock" }))] }))] }))] }));
}
function CategoryEditSection({ product }) {
    const update = (0, useProducts_1.useUpdateProduct)();
    const { data: categoriesData } = (0, useCategories_1.useCategories)();
    const [editMode, setEditMode] = (0, react_1.useState)(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = (0, react_1.useState)(product.productCategories?.map((pc) => pc.categoryId) ?? []);
    const [error, setError] = (0, react_1.useState)('');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const categories = categoriesData ? (Array.isArray(categoriesData) ? categoriesData : categoriesData.items) : [];
    async function handleSave() {
        setError('');
        setSaving(true);
        try {
            await update.mutateAsync({ id: product.id, payload: { categoryIds: selectedCategoryIds } });
            setEditMode(false);
        }
        catch {
            setError('Failed to update categories');
        }
        finally {
            setSaving(false);
        }
    }
    function handleCancel() {
        setEditMode(false);
        setSelectedCategoryIds(product.productCategories?.map((pc) => pc.categoryId) ?? []);
        setError('');
    }
    if (editMode) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [error && (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-500", children: error }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: categories.length > 0 ? (categories.map((cat) => ((0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: selectedCategoryIds.includes(cat.id), onChange: (e) => {
                                    if (e.target.checked) {
                                        setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                                    }
                                    else {
                                        setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== cat.id));
                                    }
                                }, className: "h-4 w-4 rounded border-slate-300 cursor-pointer" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-slate-700 dark:text-slate-200", children: cat.name })] }, cat.id)))) : ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-400", children: "No categories available" })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: handleSave, disabled: saving, className: "flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50", children: [saving ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3 w-3 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3 w-3" }), "Save"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleCancel, disabled: saving, className: "flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3 w-3" }), "Cancel"] })] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsx)("div", { children: product.productCategories?.length ? ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: product.productCategories.map((pc) => ((0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200", children: pc.category.name }, pc.categoryId))) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-400", children: "No categories assigned" })) }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setEditMode(true), className: "flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3 w-3" }), " Edit"] })] }));
}
function ProductImageEditor({ product }) {
    const update = (0, useProducts_1.useUpdateProduct)();
    const fileRef = (0, react_1.useRef)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [err, setErr] = (0, react_1.useState)('');
    const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
    const preview = primary?.url ?? product.featuredImage ?? '';
    async function onFile(file) {
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
            const { data: body } = await api_1.default.post('/upload/image', formData);
            const url = body?.data?.url;
            if (!url)
                throw new Error('Server nije vratio URL slike');
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
        }
        catch (e) {
            const data = e?.response?.data;
            const m = data?.message;
            const errList = data?.errors?.length ? data.errors.join('; ') : '';
            setErr(errList ||
                (typeof m === 'string'
                    ? m
                    : Array.isArray(m)
                        ? m.join('; ')
                        : 'Otpremanje nije uspelo. Pokušaj ponovo.'));
        }
        finally {
            setUploading(false);
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [err && (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-500", children: err }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-start gap-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative flex h-40 w-40 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40", children: preview ? ((0, jsx_runtime_1.jsx)("img", { src: preview, alt: "", className: "max-h-full max-w-full object-contain" })) : ((0, jsx_runtime_1.jsx)("span", { className: "px-2 text-center text-xs text-slate-400", children: "Nema slike" })) }), (0, jsx_runtime_1.jsxs)("div", { className: "min-w-0 flex-1 space-y-2", children: [(0, jsx_runtime_1.jsx)("input", { ref: fileRef, type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", className: "hidden", onChange: (e) => {
                                    const f = e.target.files?.[0];
                                    if (f)
                                        void onFile(f);
                                    e.target.value = '';
                                } }), (0, jsx_runtime_1.jsxs)("button", { type: "button", disabled: uploading || update.isPending, onClick: () => fileRef.current?.click(), className: "flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50", children: [uploading || update.isPending ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-4 w-4" })), uploading || update.isPending ? 'Čuvanje...' : 'Otpremi ili zameni sliku'] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "JPG, PNG, WEBP ili GIF \u00B7 najvi\u0161e 5MB. Ovo postavlja glavnu sliku u prodavnici." })] })] })] }));
}
const ta = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 resize-none';
const inp2 = 'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200';
function ProductDetailsEditor({ product }) {
    const queryClient = (0, react_query_1.useQueryClient)();
    const [editing, setEditing] = (0, react_1.useState)(false);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [form, setForm] = (0, react_1.useState)({
        shortDescription: product.shortDescription ?? '',
        description: product.description ?? '',
        benefits: product.benefits ?? '',
        howToUse: product.howToUse ?? '',
        composition: product.composition ?? '',
        bestSeason: product.bestSeason ?? '',
        suitablePlants: product.suitablePlants ?? '',
        seoTitle: product.seoTitle ?? '',
        seoDescription: product.seoDescription ?? '',
        aiCallScript: product.aiCallScript ?? '',
    });
    (0, react_1.useEffect)(() => {
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
            aiCallScript: product.aiCallScript ?? '',
        });
    }, [product]);
    const set = (patch) => setForm((f) => ({ ...f, ...patch }));
    async function handleSave(e) {
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
            const { data: body } = await api_1.default.patch(`/products/${product.id}`, payload);
            const updated = body && typeof body === 'object' && 'data' in body && body.data != null
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
            ]) {
                queryClient.setQueryData(key, updated);
            }
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
                queryClient.invalidateQueries({ queryKey: ['products'] }),
            ]);
            setEditing(false);
        }
        catch (err) {
            const d = err?.response?.data;
            const fromErrors = d?.errors?.length ? d.errors.join('; ') : '';
            const m = d?.message;
            const fromMessage = Array.isArray(m) ? m.join('; ') : (typeof m === 'string' ? m : '');
            setError(fromErrors || fromMessage || 'Čuvanje nije uspelo. Pokušaj ponovo.');
        }
        finally {
            setSaving(false);
        }
    }
    const hasData = form.shortDescription ||
        form.description ||
        form.benefits ||
        form.howToUse ||
        form.composition ||
        form.bestSeason ||
        form.suitablePlants ||
        form.aiCallScript;
    if (!editing) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-end", children: (0, jsx_runtime_1.jsxs)("button", { onClick: () => setEditing(true), className: "flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit2, { className: "h-3 w-3" }), " Edit"] }) }), !hasData && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-400 italic", children: "Nema unetih detalja. Klikni Edit da doda\u0161." })), form.shortDescription && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Kratki opis" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed", children: form.shortDescription })] })), form.description && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Opis" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed", children: form.description })] })), form.benefits && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Prednosti" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed", children: form.benefits })] })), form.howToUse && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Kako Koristiti" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed", children: form.howToUse })] })), form.composition && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Sastav" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed", children: form.composition })] })), form.bestSeason && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Najbolja Sezona" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300", children: form.bestSeason })] })), form.suitablePlants && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Pogodne Biljke" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300", children: form.suitablePlants })] })), form.seoTitle && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "SEO Title" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300", children: form.seoTitle })] })), form.seoDescription && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "SEO Description" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300", children: form.seoDescription })] })), form.aiCallScript ? ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/40 dark:bg-blue-900/10", children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wide dark:text-blue-400", children: "\uD83E\uDD16 AI Call Script" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed", children: form.aiCallScript })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800/30", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-blue-500 dark:text-blue-400", children: ["\uD83E\uDD16 Nema AI Call Script-a \u2014 klikni ", (0, jsx_runtime_1.jsx)("strong", { children: "Edit" }), " da doda\u0161 \u0161ta Ivana govori o ovom proizvodu"] }) }))] }));
    }
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "space-y-4", children: [error && (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-500", children: error }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Kratki opis / Short description" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 2, className: ta, placeholder: "Kratko obja\u0161njenje za listu proizvoda i kartice (1\u20132 re\u010Denice)\u2026", value: form.shortDescription, onChange: (e) => set({ shortDescription: e.target.value }) }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-slate-400", children: "Prikazuje se iznad dugog opisa u prodavnici gde je predvi\u0111eno." })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Opis / Description" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 4, className: ta, placeholder: "Opis proizvoda...", value: form.description, onChange: (e) => set({ description: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Prednosti / Benefits" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 3, className: ta, placeholder: "Prednosti i karakteristike proizvoda...", value: form.benefits, onChange: (e) => set({ benefits: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Kako Koristiti / How to Use" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 3, className: ta, placeholder: "Uputstvo za upotrebu...", value: form.howToUse, onChange: (e) => set({ howToUse: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Sastav / Composition" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 3, className: ta, placeholder: "Sastav i sastojci...", value: form.composition, onChange: (e) => set({ composition: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Najbolja Sezona / Best Season" }), (0, jsx_runtime_1.jsx)("input", { className: inp2, placeholder: "npr. Prole\u0107e, Leto, Cela godina...", value: form.bestSeason, onChange: (e) => set({ bestSeason: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "Pogodne Biljke / Suitable Plants" }), (0, jsx_runtime_1.jsx)("input", { className: inp2, placeholder: "npr. Povr\u0107e, Vo\u0107e, Cve\u0107e...", value: form.suitablePlants, onChange: (e) => set({ suitablePlants: e.target.value }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-slate-200 pt-4 dark:border-slate-700", children: (0, jsx_runtime_1.jsx)("h4", { className: "mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200", children: "SEO Settings" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "SEO Title" }), (0, jsx_runtime_1.jsx)("input", { className: inp2, placeholder: "SEO Title (60 characters max)", value: form.seoTitle, onChange: (e) => set({ seoTitle: e.target.value.slice(0, 60) }), maxLength: 60 }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-xs text-slate-400", children: [form.seoTitle.length, "/60 characters"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide", children: "SEO Description" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 2, className: ta, placeholder: "SEO Description (160 characters max)", value: form.seoDescription, onChange: (e) => set({ seoDescription: e.target.value.slice(0, 160) }), maxLength: 160 }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-xs text-slate-400", children: [form.seoDescription.length, "/160 characters"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "border-t border-blue-100 pt-4 dark:border-blue-800/30", children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-xs font-semibold text-blue-600 uppercase tracking-wide dark:text-blue-400", children: "\uD83E\uDD16 AI Call Script" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 6, className: "w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/20 dark:border-blue-800/40 dark:bg-blue-900/10 dark:text-slate-200 resize-none", placeholder: `Šta Ivana govori o ovom proizvodu?\n\nPrimer za preparat:\nOvaj preparat pomaže kod problema sa prostatom. Uzima se 2 kapsule dnevno uz obrok. Rezultati se osećaju posle 3-4 nedelje redovne upotrebe. Prirodni su sastojci, bez kontraindikacija.\n\nPrimer za elektroniku:\nErgonomski miš sa 6 dugmadi i 3200 DPI. Plug & play, nema potrebe za drajverima. Radi na Windows i Mac. Kabel 1.8m.`, value: form.aiCallScript, onChange: (e) => set({ aiCallScript: e.target.value }) }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-blue-500 dark:text-blue-400", children: "Ivana koristi ovaj tekst kada zove kupce koji su poru\u010Dili ovaj proizvod" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 pt-1", children: [(0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: saving, className: "flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-50", children: [saving ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-3.5 w-3.5" }), "Sa\u010Duvaj"] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => { setEditing(false); setError(''); }, className: "flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5" }), "Otka\u017Ei"] })] })] }));
}
function ProductDetailPage({ params }) {
    const { id } = (0, react_1.use)(params);
    const router = (0, navigation_1.useRouter)();
    const { data: product, isLoading, error } = (0, useProducts_1.useProduct)(id);
    const deleteProduct = (0, useProducts_1.useDeleteProduct)();
    const [deleteModal, setDeleteModal] = (0, react_1.useState)(false);
    const [deleteError, setDeleteError] = (0, react_1.useState)('');
    if (isLoading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-5", children: [(0, jsx_runtime_1.jsx)(SkeletonCard_1.Skeleton, { className: "h-8 w-48" }), (0, jsx_runtime_1.jsx)(SkeletonCard_1.Skeleton, { className: "h-32 w-full" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid gap-4 lg:grid-cols-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 lg:col-span-2", children: [(0, jsx_runtime_1.jsx)(SkeletonCard_1.Skeleton, { className: "h-48 w-full" }), (0, jsx_runtime_1.jsx)(SkeletonCard_1.Skeleton, { className: "h-32 w-full" })] }), (0, jsx_runtime_1.jsx)(SkeletonCard_1.Skeleton, { className: "h-64 w-full" })] })] }));
    }
    if (error || !product) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center gap-3 py-20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-10 w-10 text-amber-400" }), (0, jsx_runtime_1.jsx)("p", { className: "text-slate-500", children: "Product not found or failed to load." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/products", className: "text-sm text-indigo-600 hover:underline", children: "\u2190 Back to Products" })] }));
    }
    const primaryImage = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
    const displayImage = primaryImage?.url ?? product.featuredImage ?? null;
    const categories = product.productCategories?.map((pc) => pc.category.name).join(', ') || '—';
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-5", children: [(0, jsx_runtime_1.jsxs)(link_1.default, { href: "/products", className: "inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-white", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), "Products"] }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 p-6 sm:flex-row sm:items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700", children: displayImage ? ((0, jsx_runtime_1.jsx)("img", { src: displayImage, alt: product.name, className: "max-h-full max-w-full object-contain" })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex h-full w-full items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Package, { className: "h-8 w-8 text-slate-300 dark:text-slate-600" }) })) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-3", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold text-slate-800 dark:text-white", children: product.name }), (0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[product.status]}`, children: product.status.charAt(0) + product.status.slice(1).toLowerCase() }), !product.isActive && ((0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400", children: "Hidden from store" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-mono text-xs", children: ["SKU: ", product.sku] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Slug: ", (0, jsx_runtime_1.jsx)("span", { className: "font-mono text-xs", children: product.slug })] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Updated: ", (0, utils_1.formatDateTime)(product.updatedAt)] })] }), product.shortDescription && ((0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-slate-600 dark:text-slate-300", children: product.shortDescription }))] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setDeleteModal(true), className: "flex h-9 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }), "Delete"] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid gap-4 lg:grid-cols-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 lg:col-span-2", children: [(0, jsx_runtime_1.jsxs)(SectionCard, { title: "Pricing", icon: lucide_react_1.Tag, children: [(0, jsx_runtime_1.jsx)(InfoRow, { label: "Price", value: (0, jsx_runtime_1.jsx)("span", { className: "font-semibold", children: (0, utils_1.formatCurrency)(product.price, product.currency) }) }), product.compareAtPrice != null && ((0, jsx_runtime_1.jsx)(InfoRow, { label: "Compare at price", value: (0, jsx_runtime_1.jsx)("span", { className: product.compareAtPrice > product.price ? 'text-slate-400 line-through' : '', children: (0, utils_1.formatCurrency)(product.compareAtPrice, product.currency) }) })), product.costPrice != null && ((0, jsx_runtime_1.jsx)(InfoRow, { label: "Cost price", value: (0, utils_1.formatCurrency)(product.costPrice, product.currency) })), (0, jsx_runtime_1.jsx)(InfoRow, { label: "Currency", value: product.currency }), product.compareAtPrice != null && product.compareAtPrice > product.price && ((0, jsx_runtime_1.jsx)(InfoRow, { label: "Discount", value: (0, jsx_runtime_1.jsxs)("span", { className: "text-emerald-600 font-semibold dark:text-emerald-400", children: [Math.round((1 - product.price / product.compareAtPrice) * 100), "% off"] }) }))] }), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "Inventory", icon: lucide_react_1.BarChart2, children: [(0, jsx_runtime_1.jsx)(InfoRow, { label: "Track quantity", value: product.trackQuantity ? 'Yes' : 'No' }), product.trackQuantity && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(InfoRow, { label: "Stock quantity", value: (0, jsx_runtime_1.jsxs)("span", { className: product.stockQuantity === 0 ? 'text-red-600 font-semibold dark:text-red-400' :
                                                        product.stockQuantity <= product.lowStockThreshold ? 'text-amber-600 font-semibold dark:text-amber-400' :
                                                            'font-semibold', children: [product.stockQuantity, " units"] }) }), (0, jsx_runtime_1.jsx)(InfoRow, { label: "Low stock threshold", value: `${product.lowStockThreshold} units` })] })), (0, jsx_runtime_1.jsx)(InfoRow, { label: "In stock", value: product.inStock
                                            ? (0, jsx_runtime_1.jsx)("span", { className: "text-emerald-600 dark:text-emerald-400", children: "Yes" })
                                            : (0, jsx_runtime_1.jsx)("span", { className: "text-red-600 dark:text-red-400", children: "No" }) })] }), (0, jsx_runtime_1.jsx)(SectionCard, { title: "Categories", icon: lucide_react_1.Layers, children: (0, jsx_runtime_1.jsx)(CategoryEditSection, { product: product }) }), (0, jsx_runtime_1.jsx)(SectionCard, { title: "Glavna slika proizvoda", icon: lucide_react_1.Package, children: (0, jsx_runtime_1.jsx)(ProductImageEditor, { product: product }) }), product.images && product.images.length > 0 && ((0, jsx_runtime_1.jsx)(SectionCard, { title: `Images (${product.images.length})`, icon: lucide_react_1.Package, children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-4 gap-3 sm:grid-cols-6", children: product.images.map((img) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700", children: [(0, jsx_runtime_1.jsx)("img", { src: img.url, alt: img.altText ?? product.name, className: "h-full w-full object-cover" }), img.isPrimary && ((0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-xs text-white", children: "Primary" }))] }, img.id))) }) })), (0, jsx_runtime_1.jsx)(SectionCard, { title: "Opis / Description", icon: lucide_react_1.Package, children: (0, jsx_runtime_1.jsx)(ProductDetailsEditor, { product: product }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(SectionCard, { title: "Quick Edit", icon: lucide_react_1.Edit2, children: (0, jsx_runtime_1.jsx)(QuickEditPanel, { product: product }) }), (product.seoTitle || product.seoDescription) && ((0, jsx_runtime_1.jsxs)(SectionCard, { title: "SEO", icon: lucide_react_1.Tag, children: [product.seoTitle && (0, jsx_runtime_1.jsx)(InfoRow, { label: "SEO title", value: product.seoTitle }), product.seoDescription && (0, jsx_runtime_1.jsx)(InfoRow, { label: "SEO description", value: product.seoDescription })] })), (0, jsx_runtime_1.jsxs)(SectionCard, { title: "Details", icon: lucide_react_1.CheckCircle2, children: [(0, jsx_runtime_1.jsx)(InfoRow, { label: "Created", value: (0, utils_1.formatDateTime)(product.createdAt) }), (0, jsx_runtime_1.jsx)(InfoRow, { label: "Updated", value: (0, utils_1.formatDateTime)(product.updatedAt) }), (0, jsx_runtime_1.jsx)(InfoRow, { label: "Category", value: categories })] })] })] }), (0, jsx_runtime_1.jsx)(Modal_1.Modal, { open: deleteModal, title: "Delete product?", onClose: () => { setDeleteModal(false); setDeleteError(''); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3 rounded-xl bg-red-50 p-3 dark:bg-red-900/10", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-red-700 dark:text-red-400", children: "This action is permanent" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-xs text-red-600 dark:text-red-500", children: ["Deleting ", (0, jsx_runtime_1.jsx)("strong", { children: product.name }), " cannot be undone. Any orders referencing this product will retain historical data."] })] })] }), deleteError && (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-red-500", children: deleteError }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setDeleteModal(false); setDeleteError(''); }, className: "rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300", children: "Cancel" }), (0, jsx_runtime_1.jsxs)("button", { disabled: deleteProduct.isPending, onClick: async () => {
                                        setDeleteError('');
                                        try {
                                            await deleteProduct.mutateAsync(product.id);
                                            router.push('/products');
                                        }
                                        catch {
                                            setDeleteError('Failed to delete product. It may be referenced in existing orders.');
                                        }
                                    }, className: "flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50", children: [deleteProduct.isPending ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : null, "Delete product"] })] })] }) })] }));
}
//# sourceMappingURL=admin-product-detail-page.js.map