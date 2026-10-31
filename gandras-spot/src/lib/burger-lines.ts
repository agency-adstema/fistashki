import type { CartLine, MenuCategoryId, OrderDraft } from "@/lib/types";

function newLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Legacy helper — expands old qty map into cart lines */
export function expandBurgerQtyToLines(draft: OrderDraft): CartLine[] {
  const qty = draft.burgerQty ?? {};
  const lines: CartLine[] = [];
  for (const [productId, n] of Object.entries(qty)) {
    for (let i = 0; i < n; i++) {
      lines.push({
        lineId: newLineId(),
        productId,
        menuCategory: "burgers" as MenuCategoryId,
        saladIds: [],
        extraIds: [],
      });
    }
  }
  return lines;
}
