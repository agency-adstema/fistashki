import {
  BURGERS,
  DRINKS,
  EXTRAS,
  FRIES,
  LEPINJE,
  PRODUCTS,
  SALADS,
  SANDWICHES,
} from "@/lib/data/menu";
import type { ApiMenuRow } from "@/lib/api";
import type { MenuCategoryId, MenuItem } from "@/lib/types";
import { parseCompositionText } from "@/lib/composition";

const slug = (row: ApiMenuRow) => row.slug || row.id;

const CATEGORY_META: Record<
  MenuCategoryId,
  { itemCategory: MenuItem["category"]; fallback: MenuItem[] }
> = {
  burgers: { itemCategory: "burger", fallback: BURGERS },
  sandwiches: { itemCategory: "sandwich", fallback: SANDWICHES },
  lepinje: { itemCategory: "lepinja", fallback: LEPINJE },
  pomfrit: { itemCategory: "side", fallback: FRIES },
};

function resolveMenuCategory(row: ApiMenuRow): MenuCategoryId {
  const fromApi = row.categorySlug;
  if (fromApi === "burgers" || fromApi === "sandwiches" || fromApi === "lepinje" || fromApi === "pomfrit") {
    return fromApi;
  }
  const id = slug(row);
  if (BURGERS.some((p) => p.id === id)) return "burgers";
  if (SANDWICHES.some((p) => p.id === id)) return "sandwiches";
  if (LEPINJE.some((p) => p.id === id)) return "lepinje";
  if (FRIES.some((p) => p.id === id) || id.startsWith("pomfrit")) return "pomfrit";
  return "burgers";
}

function mergeAddonCategory(
  staticItems: MenuItem[],
  apiRows: ApiMenuRow[] | undefined,
  category: MenuItem["category"],
): MenuItem[] {
  if (!apiRows?.length) return staticItems;
  const staticById = Object.fromEntries(staticItems.map((i) => [i.id, i]));

  const mapped: MenuItem[] = apiRows
    .filter((r) => r.isAvailable !== false)
    .filter((r) => r.slug !== "pomfrit")
    .map((row): MenuItem => {
      const id = slug(row);
      const fallback = staticById[id];
      return {
        id,
        name: row.name,
        description: row.description ?? fallback?.description,
        composition: fallback?.composition,
        price: row.price,
        image: row.imageUrl || fallback?.image || "",
        category: fallback?.category ?? category,
        available: true,
      };
    });

  const mappedIds = new Set(mapped.map((m) => m.id));
  for (const item of staticItems) {
    if (!mappedIds.has(item.id)) mapped.push(item);
  }
  return mapped;
}

function mapProductRow(row: ApiMenuRow): MenuItem {
  const id = slug(row);
  const menuCategory = resolveMenuCategory(row);
  const meta = CATEGORY_META[menuCategory];
  const fallback = meta.fallback.find((p) => p.id === id) ?? PRODUCTS.find((p) => p.id === id);
  const fromAdmin = parseCompositionText(row.description);

  return {
    id,
    name: row.name,
    description: undefined,
    composition: fromAdmin.length > 0 ? fromAdmin : fallback?.composition,
    price: row.price,
    image: row.imageUrl || fallback?.image || "",
    category: fallback?.category ?? meta.itemCategory,
    menuCategory,
    simple: fallback?.simple,
    available: row.isAvailable !== false,
  };
}

/**
 * Shop meni: backend proizvodi su izvor istine.
 * Statički meni se koristi samo kao fallback (slika/sastav) i kad API nije dostupan.
 */
export function mapPublicMenu(data: {
  burgers?: ApiMenuRow[];
  products?: ApiMenuRow[];
  breads?: ApiMenuRow[];
  ingredients?: ApiMenuRow[];
  extras?: ApiMenuRow[];
  drinks?: ApiMenuRow[];
}) {
  const apiProducts = (data.products?.length ? data.products : data.burgers) ?? [];
  const available = apiProducts.filter((r) => r.isAvailable !== false && slug(r) !== "pomfrit");

  if (available.length > 0) {
    const products = available.map(mapProductRow);
    const burgers = products.filter((p) => p.menuCategory === "burgers");
    const sandwiches = products.filter((p) => p.menuCategory === "sandwiches");
    const lepinje = products.filter((p) => p.menuCategory === "lepinje");
    const fries = products.filter((p) => p.menuCategory === "pomfrit");

    return {
      products,
      burgers,
      sandwiches,
      lepinje,
      fries,
      salads: mergeAddonCategory(SALADS, data.ingredients, "salad"),
      extras: mergeAddonCategory(EXTRAS, data.extras, "extra").filter((e) => e.id !== "pomfrit"),
      drinks: mergeAddonCategory(DRINKS, data.drinks, "drink"),
    };
  }

  // Offline / prazan API — statički fallback
  return {
    products: PRODUCTS,
    burgers: BURGERS,
    sandwiches: SANDWICHES,
    lepinje: LEPINJE,
    fries: FRIES,
    salads: mergeAddonCategory(SALADS, data.ingredients, "salad"),
    extras: mergeAddonCategory(EXTRAS, data.extras, "extra").filter((e) => e.id !== "pomfrit"),
    drinks: mergeAddonCategory(DRINKS, data.drinks, "drink"),
  };
}
