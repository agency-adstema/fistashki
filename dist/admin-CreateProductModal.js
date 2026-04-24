'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductModal = CreateProductModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const Modal_1 = require("@/components/ui/Modal");
const useProducts_1 = require("@/hooks/useProducts");
const useCategories_1 = require("@/hooks/useCategories");
const navigation_1 = require("next/navigation");
const api_1 = __importDefault(require("@/lib/api"));
const inp = 'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200';
const sel = 'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200';
function Field({ label, required, children }) {
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", { className: "mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400", children: [label, required && (0, jsx_runtime_1.jsx)("span", { className: "ml-0.5 text-red-500", children: "*" })] }), children] }));
}
function toSlug(s) {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
function ImageUpload({ value, onChange }) {
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [dragOver, setDragOver] = (0, react_1.useState)(false);
    const [uploadError, setUploadError] = (0, react_1.useState)('');
    const fileRef = (0, react_1.useRef)(null);
    async function uploadFile(file) {
        if (!file.type.startsWith('image/')) {
            setUploadError('Only images are allowed (jpg, png, webp, gif)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image must be smaller than 5MB');
            return;
        }
        setUploadError('');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await api_1.default.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onChange(data.data.url);
        }
        catch {
            setUploadError('Upload failed. Try again.');
        }
        finally {
            setUploading(false);
        }
    }
    function onDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file)
            uploadFile(file);
    }
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { onDragOver: (e) => { e.preventDefault(); setDragOver(true); }, onDragLeave: () => setDragOver(false), onDrop: onDrop, onClick: () => !value && fileRef.current?.click(), className: `relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${dragOver
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10'
                    : value
                        ? 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                        : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/30 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-amber-500'}`, children: uploading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center gap-2 text-slate-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-7 w-7 animate-spin text-amber-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs", children: "Uploading..." })] })) : value ? ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-full", children: [(0, jsx_runtime_1.jsx)("img", { src: value, alt: "Product", className: "max-h-32 w-full rounded-lg object-contain p-2" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: (e) => { e.stopPropagation(); onChange(''); }, className: "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-3.5 w-3.5" }) })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center gap-2 px-4 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/20", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "h-5 w-5 text-amber-600 dark:text-amber-400" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm font-medium text-slate-600 dark:text-slate-300", children: ["Drag image here or ", (0, jsx_runtime_1.jsx)("span", { className: "text-amber-600 dark:text-amber-400", children: "click to select" })] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-0.5 text-xs text-slate-400", children: "JPG, PNG, WEBP, GIF \u00B7 max 5MB" })] })] })) }), (0, jsx_runtime_1.jsx)("input", { ref: fileRef, type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", className: "hidden", onChange: (e) => { const f = e.target.files?.[0]; if (f)
                    uploadFile(f); e.target.value = ''; } }), uploadError && (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-red-500", children: uploadError }), !value && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-1.5 flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Image, { className: "h-3 w-3 text-slate-300" }), (0, jsx_runtime_1.jsx)("input", { className: "flex-1 rounded border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-500 placeholder:text-slate-300 outline-none focus:border-amber-400 dark:border-slate-600", placeholder: "or paste image URL...", onBlur: (e) => { if (e.target.value.trim())
                            onChange(e.target.value.trim()); }, onKeyDown: (e) => { if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = e.target.value.trim();
                            if (v)
                                onChange(v);
                        } } })] }))] }));
}
const defaultForm = () => ({
    name: '',
    slug: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    shortDescription: '',
    description: '',
    benefits: '',
    howToUse: '',
    composition: '',
    bestSeason: '',
    suitablePlants: '',
    seoTitle: '',
    seoDescription: '',
    categoryIds: [],
    status: 'ACTIVE',
    trackQuantity: false,
    stockQuantity: '0',
    featuredImage: '',
});
function CreateProductModal({ open, onClose }) {
    const create = (0, useProducts_1.useCreateProduct)();
    const { data: categoriesData } = (0, useCategories_1.useCategories)();
    const router = (0, navigation_1.useRouter)();
    const [form, setForm] = (0, react_1.useState)(defaultForm);
    const [error, setError] = (0, react_1.useState)('');
    const [slugManual, setSlugManual] = (0, react_1.useState)(false);
    const set = (patch) => setForm((f) => ({ ...f, ...patch }));
    function handleClose() {
        setForm(defaultForm());
        setSlugManual(false);
        setError('');
        onClose();
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        const price = parseFloat(form.price);
        if (isNaN(price) || price <= 0) {
            setError('Price must be a positive number');
            return;
        }
        try {
            const slugFinal = toSlug(form.slug.trim() || form.name.trim());
            if (!slugFinal) {
                setError('Unesi naziv ili slug koji daju validan URL (samo slova, brojevi, crtice)');
                return;
            }
            const product = await create.mutateAsync({
                name: form.name.trim(),
                slug: slugFinal,
                sku: form.sku.trim().toUpperCase(),
                price,
                compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
                shortDescription: form.shortDescription.trim() || undefined,
                description: form.description.trim() || undefined,
                benefits: form.benefits.trim() || undefined,
                howToUse: form.howToUse.trim() || undefined,
                composition: form.composition.trim() || undefined,
                bestSeason: form.bestSeason.trim() || undefined,
                suitablePlants: form.suitablePlants.trim() || undefined,
                seoTitle: form.seoTitle.trim() || undefined,
                seoDescription: form.seoDescription.trim() || undefined,
                categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
                status: form.status,
                isActive: form.status === 'ACTIVE',
                trackQuantity: form.trackQuantity,
                stockQuantity: form.trackQuantity ? parseInt(form.stockQuantity, 10) : 0,
                featuredImage: form.featuredImage.trim() || undefined,
                currency: 'RSD',
            });
            handleClose();
            router.push(`/products/${product.id}`);
        }
        catch (err) {
            const msg = err?.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create product'));
        }
    }
    const categories = categoriesData?.items || [];
    return ((0, jsx_runtime_1.jsx)(Modal_1.Modal, { open: open, title: "New Product", onClose: handleClose, className: "max-w-lg", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4 max-h-[70vh] overflow-y-auto pr-2", children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400", children: error })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400", children: "Product Image" }), (0, jsx_runtime_1.jsx)(ImageUpload, { value: form.featuredImage, onChange: (url) => set({ featuredImage: url }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid gap-3 sm:grid-cols-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsx)(Field, { label: "Product Name", required: true, children: (0, jsx_runtime_1.jsx)("input", { className: inp, placeholder: "e.g. Wireless Headphones", value: form.name, onChange: (e) => {
                                        const name = e.target.value;
                                        setForm((f) => ({
                                            ...f,
                                            name,
                                            ...(!slugManual ? { slug: toSlug(name) } : {}),
                                        }));
                                    }, required: true }) }) }), (0, jsx_runtime_1.jsx)(Field, { label: "SKU", required: true, children: (0, jsx_runtime_1.jsx)("input", { className: inp, placeholder: "e.g. HEADPHONES-001", value: form.sku, onChange: (e) => set({ sku: e.target.value }), required: true }) }), (0, jsx_runtime_1.jsxs)(Field, { label: "Slug (URL u prodavnici)", children: [(0, jsx_runtime_1.jsx)("input", { className: inp, placeholder: "npr. agro-verm-k-0-5l", value: form.slug, onChange: (e) => {
                                        setSlugManual(true);
                                        set({ slug: e.target.value });
                                    } }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                        setSlugManual(false);
                                        set({ slug: toSlug(form.name) });
                                    }, className: "mt-1 text-[11px] font-medium text-amber-700 hover:underline dark:text-amber-400", children: "Ponovo generi\u0161i iz naziva" })] }), (0, jsx_runtime_1.jsx)(Field, { label: "Category", children: (0, jsx_runtime_1.jsxs)("select", { className: sel, value: form.categoryIds[0] || '', onChange: (e) => set({ categoryIds: e.target.value ? [e.target.value] : [] }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "-- Select Category --" }), categories.map((cat) => ((0, jsx_runtime_1.jsx)("option", { value: cat.id, children: cat.name }, cat.id)))] }) }), (0, jsx_runtime_1.jsx)(Field, { label: "Price (RSD)", required: true, children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400", children: "RSD" }), (0, jsx_runtime_1.jsx)("input", { className: `${inp} pl-10`, type: "number", min: "1", step: "1", placeholder: "0", value: form.price, onChange: (e) => set({ price: e.target.value }), required: true })] }) }), (0, jsx_runtime_1.jsx)(Field, { label: "Compare at Price (RSD)", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400", children: "RSD" }), (0, jsx_runtime_1.jsx)("input", { className: `${inp} pl-10`, type: "number", min: "0", step: "1", placeholder: "0 (optional)", value: form.compareAtPrice, onChange: (e) => set({ compareAtPrice: e.target.value }) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsx)(Field, { label: "Status", children: (0, jsx_runtime_1.jsxs)("select", { className: sel, value: form.status, onChange: (e) => set({ status: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "ACTIVE", children: "Active" }), (0, jsx_runtime_1.jsx)("option", { value: "DRAFT", children: "Draft" }), (0, jsx_runtime_1.jsx)("option", { value: "ARCHIVED", children: "Archived" })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsx)(Field, { label: "Short Description", children: (0, jsx_runtime_1.jsx)("textarea", { className: `${inp} h-16 resize-none py-2`, placeholder: "Short product description (optional)", value: form.shortDescription, onChange: (e) => set({ shortDescription: e.target.value }) }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsx)(Field, { label: "Description", children: (0, jsx_runtime_1.jsx)("textarea", { className: `${inp} h-20 resize-none py-2`, placeholder: "Full product description (optional)", value: form.description, onChange: (e) => set({ description: e.target.value }) }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsx)(Field, { label: "Benefits / Prednosti", children: (0, jsx_runtime_1.jsx)("textarea", { className: `${inp} h-16 resize-none py-2`, placeholder: "Product benefits and advantages (optional)", value: form.benefits, onChange: (e) => set({ benefits: e.target.value }) }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsx)(Field, { label: "How to Use / Kako Koristiti", children: (0, jsx_runtime_1.jsx)("textarea", { className: `${inp} h-16 resize-none py-2`, placeholder: "Usage instructions (optional)", value: form.howToUse, onChange: (e) => set({ howToUse: e.target.value }) }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsxs)(Field, { label: "\uD83E\uDD16 AI Call Script (\u0161ta Ivana govori o ovom proizvodu)", children: [(0, jsx_runtime_1.jsx)("textarea", { className: `${inp} h-28 resize-none py-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20`, placeholder: `Primer za preparat:\n"Ovaj preparat se koristi za prostatu. Preporučuje se 2 kapsule dnevno uz obrok. Rezultati se vide posle 3-4 nedelje. Posebno je efikasan kod problema sa mokrenjem..."\n\nPrimer za elektroniku:\n"Ergonomski miš sa 6 dugmadi i DPI do 3200. Kompatibilan sa Windows i Mac. USB prijemnik se uključuje i odmah radi bez drajvera..."`, value: form.aiCallScript || '', onChange: (e) => set({ aiCallScript: e.target.value }) }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-blue-500", children: "Ivana \u0107e koristiti ovaj tekst kada zove kupce koji su poru\u010Dili ovaj proizvod" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsx)(Field, { label: "Composition / Sastav", children: (0, jsx_runtime_1.jsx)("textarea", { className: `${inp} h-16 resize-none py-2`, placeholder: "Ingredients or composition (optional)", value: form.composition, onChange: (e) => set({ composition: e.target.value }) }) }) }), (0, jsx_runtime_1.jsx)(Field, { label: "Best Season / Najbolja Sezona", children: (0, jsx_runtime_1.jsx)("input", { className: inp, placeholder: "e.g. Spring, Summer, All year round (optional)", value: form.bestSeason, onChange: (e) => set({ bestSeason: e.target.value }) }) }), (0, jsx_runtime_1.jsx)(Field, { label: "Suitable Plants / Pogodne Biljke", children: (0, jsx_runtime_1.jsx)("input", { className: inp, placeholder: "e.g. Vegetables, Fruits, Flowers (optional)", value: form.suitablePlants, onChange: (e) => set({ suitablePlants: e.target.value }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2 border-t border-slate-200 pt-4 dark:border-slate-700", children: (0, jsx_runtime_1.jsx)("p", { className: "mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300", children: "SEO Settings" }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsxs)(Field, { label: "SEO Title", children: [(0, jsx_runtime_1.jsx)("input", { className: inp, placeholder: "e.g. Best Organic Seeds for Home Garden - Buy Now", value: form.seoTitle, onChange: (e) => set({ seoTitle: e.target.value }), maxLength: 60 }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-xs text-slate-400", children: [form.seoTitle.length, "/60 characters"] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "sm:col-span-2", children: (0, jsx_runtime_1.jsxs)(Field, { label: "SEO Description", children: [(0, jsx_runtime_1.jsx)("textarea", { className: `${inp} h-16 resize-none py-2`, placeholder: "Brief description for search engines (important for SEO)", value: form.seoDescription, onChange: (e) => set({ seoDescription: e.target.value }), maxLength: 160 }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-xs text-slate-400", children: [form.seoDescription.length, "/160 characters"] })] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 dark:border-slate-600", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-700 dark:text-slate-200", children: "Track Inventory" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-400", children: "Enable to manage stock quantity" })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => set({ trackQuantity: !form.trackQuantity }), className: `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.trackQuantity ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`, children: (0, jsx_runtime_1.jsx)("span", { className: `inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.trackQuantity ? 'translate-x-4' : 'translate-x-0.5'}` }) })] }), form.trackQuantity && ((0, jsx_runtime_1.jsx)(Field, { label: "Initial Stock Quantity", children: (0, jsx_runtime_1.jsx)("input", { className: inp, type: "number", min: "0", value: form.stockQuantity, onChange: (e) => set({ stockQuantity: e.target.value }) }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2 pt-1", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleClose, className: "rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300", children: "Cancel" }), (0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: create.isPending, className: "flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-50", children: [create.isPending && (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }), "Create Product"] })] })] }) }));
}
//# sourceMappingURL=admin-CreateProductModal.js.map