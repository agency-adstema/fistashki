import { PRODUCTS, getFriesLinePrice, formatFriesSizeLabel } from "@/lib/data/menu";
import { useMenuStore } from "@/store/menu-store";
import type { CartLine } from "@/lib/types";

export function resolveProduct(productId: string) {
  const { products } = useMenuStore.getState();
  return products.find((p) => p.id === productId) ?? PRODUCTS.find((p) => p.id === productId);
}

export function calcCartLineTotal(line: CartLine): number {
  const product = resolveProduct(line.productId);
  if (!product) return 0;
  const { salads, extras } = useMenuStore.getState();
  let total =
    line.menuCategory === "pomfrit" && line.friesSize
      ? getFriesLinePrice(line.friesSize)
      : product.price;
  line.saladIds.forEach((id) => {
    total += salads.find((s) => s.id === id)?.price ?? 0;
  });
  line.extraIds.forEach((id) => {
    total += extras.find((e) => e.id === id)?.price ?? 0;
  });
  return total;
}

export function getCartLineTitle(line: CartLine): string {
  const product = resolveProduct(line.productId);
  const baseName = product?.name ?? "Proizvod";
  if (line.menuCategory === "pomfrit" && line.friesSize) {
    return `${baseName} — ${formatFriesSizeLabel(line.friesSize)}`;
  }
  return baseName;
}

export function getCartLineSubItems(line: CartLine): { name: string; price: number }[] {
  const { salads, extras } = useMenuStore.getState();
  const items: { name: string; price: number }[] = [];
  line.saladIds.forEach((id) => {
    const s = salads.find((x) => x.id === id);
    if (s) items.push({ name: s.name, price: s.price });
  });
  line.extraIds.forEach((id) => {
    const e = extras.find((x) => x.id === id);
    if (e) items.push({ name: e.name, price: e.price });
  });
  return items;
}
