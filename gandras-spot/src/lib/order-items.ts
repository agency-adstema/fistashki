export type OrderLineItem = {
  name: string;
  totalPrice: number;
  quantity?: number;
  kind?: string | null;
  options?: Record<string, unknown> | null;
};

const DELIVERY_SKIP_KINDS = new Set(["ingredient", "extra", "bread"]);

function stripLinePrefix(name: string): string {
  return name.replace(/^(?:Burger|Stavka)(?: \d+)? · /, "");
}

/** Glavne stavke za kurira / dostavu — bez salata, ekstra i testa. */
export function toDeliveryMainItems(
  items: Array<{
    name: string;
    quantity?: number;
    totalPrice?: number;
    kind?: string | null;
    options?: Record<string, unknown> | null;
  }>,
): OrderLineItem[] {
  return items
    .filter((item) => {
      const kind = item.kind ?? null;
      if (kind && DELIVERY_SKIP_KINDS.has(kind)) return false;
      if (kind === "burger" || kind === "side" || kind === "drink") return true;
      if ((item.options as { productId?: string } | null)?.productId) return true;
      if ((item.options as { drinkId?: string } | null)?.drinkId) return true;
      // Stariji zapisi bez kind — ne prikazuj sumnjive sitnice
      return false;
    })
    .map((item) => ({
      name: stripLinePrefix(item.name),
      totalPrice: item.totalPrice ?? 0,
      quantity: item.quantity,
      kind: item.kind,
      options: item.options,
    }));
}

export type OrderItemGroup = {
  title: string | null;
  titlePrice?: number;
  items: { name: string; totalPrice: number }[];
};

const DRINKS_GROUP_TITLE = "Napitak";

type GroupItem = {
  name: string;
  totalPrice: number;
  quantity?: number;
  kind?: string | null;
  options?: Record<string, unknown> | null;
};

function itemLabel(item: GroupItem): string {
  if (item.quantity && item.quantity > 1 && !item.name.match(/^\d+× /)) {
    return `${item.quantity}× ${item.name}`;
  }
  return item.name;
}

function isBurgerItem(item: GroupItem): boolean {
  if (item.kind === "burger") return true;
  return Boolean((item.options as { productId?: string } | null)?.productId);
}

function isDrinkItem(item: Pick<GroupItem, "kind" | "options" | "name">): boolean {
  if (item.kind === "drink") return true;
  if ((item.options as { drinkId?: string } | null)?.drinkId) return true;
  return false;
}

function mapGroupItems(items: GroupItem[]): { name: string; totalPrice: number }[] {
  return items.map((i) => ({ name: itemLabel(i), totalPrice: i.totalPrice }));
}

function drinksGroup(items: GroupItem[]): OrderItemGroup | null {
  if (items.length === 0) return null;
  return { title: DRINKS_GROUP_TITLE, items: mapGroupItems(items) };
}

function finalizeBurgerGroup(group: { title: string | null; items: GroupItem[] }): OrderItemGroup {
  const burgerIdx = group.items.findIndex(isBurgerItem);

  if (burgerIdx >= 0) {
    const burger = group.items[burgerIdx];
    return {
      title: burger.name,
      titlePrice: burger.totalPrice,
      items: group.items
        .filter((_, i) => i !== burgerIdx)
        .map((i) => ({ name: itemLabel(i), totalPrice: i.totalPrice })),
    };
  }

  const nonBread = group.items.filter((i) => !i.name.startsWith("Testo:"));
  if (nonBread.length > 0) {
    const burger = nonBread.reduce((best, item) =>
      item.totalPrice > best.totalPrice ? item : best,
    );
    const idx = group.items.indexOf(burger);
    return {
      title: burger.name,
      titlePrice: burger.totalPrice,
      items: group.items
        .filter((_, i) => i !== idx)
        .map((i) => ({ name: itemLabel(i), totalPrice: i.totalPrice })),
    };
  }

  return {
    title: group.title,
    items: mapGroupItems(group.items),
  };
}

function appendDrinks(groups: OrderItemGroup[], drinks: GroupItem[]): OrderItemGroup[] {
  const drinkGroup = drinksGroup(drinks);
  return drinkGroup ? [...groups, drinkGroup] : groups;
}

function groupByBurgerLineMeta(items: OrderLineItem[]): OrderItemGroup[] {
  const lineCount = items.reduce((max, item) => {
    const line = (item.options as { burgerLine?: number } | null)?.burgerLine;
    return line && line > max ? line : max;
  }, 0);

  const groups: OrderItemGroup[] = [];
  for (let line = 1; line <= lineCount; line++) {
    const lineItems = items.filter(
      (i) => (i.options as { burgerLine?: number } | null)?.burgerLine === line,
    );
    if (lineItems.length === 0) continue;
    groups.push(
      finalizeBurgerGroup({
        title: null,
        items: lineItems.map((i) => ({
          name: itemLabel(i),
          totalPrice: i.totalPrice,
          quantity: i.quantity,
          kind: i.kind,
          options: i.options,
        })),
      }),
    );
  }

  const ungrouped = items.filter((i) => !(i.options as { burgerLine?: number } | null)?.burgerLine);
  const drinkItems = ungrouped.filter(isDrinkItem);
  const otherItems = ungrouped.filter((i) => !isDrinkItem(i));

  if (otherItems.length > 0) {
    groups.push({ title: null, items: mapGroupItems(otherItems) });
  }

  return appendDrinks(groups, drinkItems);
}

/** Grupiše stavke po burgeru; pića pod „Napitak“ */
export function groupOrderItems(items: OrderLineItem[]): OrderItemGroup[] {
  const hasPrefixedNames = items.some(
    (i) => i.name.startsWith("Burger ") || i.name.startsWith("Stavka "),
  );
  const hasLineMeta = items.some(
    (i) => typeof (i.options as { burgerLine?: number } | null)?.burgerLine === "number",
  );

  if (!hasPrefixedNames && hasLineMeta) {
    return groupByBurgerLineMeta(items);
  }

  if (!hasPrefixedNames) {
    const drinkItems = items.filter(isDrinkItem);
    const otherItems = items.filter((i) => !isDrinkItem(i));
    const groups: OrderItemGroup[] = [];
    if (otherItems.length > 0) {
      groups.push({ title: null, items: mapGroupItems(otherItems) });
    }
    return appendDrinks(groups, drinkItems);
  }

  const rawGroups: { title: string | null; items: GroupItem[] }[] = [];
  const drinkItems: GroupItem[] = [];

  for (const item of items) {
    const multi = item.name.match(/^((?:Burger|Stavka) \d+) · (.+)$/);
    const single = item.name.match(/^(?:Burger|Stavka) · (.+)$/);

    if (multi || single) {
      const title = multi ? multi[1] : "Stavka";
      const name = multi ? multi[2] : single![1];
      let group = rawGroups.find((g) => g.title === title);
      if (!group) {
        group = { title, items: [] };
        rawGroups.push(group);
      }
      group.items.push({
        name,
        totalPrice: item.totalPrice,
        quantity: item.quantity,
        kind: item.kind,
        options: item.options,
      });
      continue;
    }

    if (isDrinkItem(item)) {
      drinkItems.push({
        name: itemLabel(item),
        totalPrice: item.totalPrice,
        quantity: item.quantity,
        kind: item.kind,
        options: item.options,
      });
      continue;
    }

    const last = rawGroups[rawGroups.length - 1];
    if (last && last.title !== null) {
      last.items.push({
        name: itemLabel(item),
        totalPrice: item.totalPrice,
        quantity: item.quantity,
        kind: item.kind,
        options: item.options,
      });
    } else if (last?.title === null) {
      last.items.push({
        name: itemLabel(item),
        totalPrice: item.totalPrice,
        quantity: item.quantity,
        kind: item.kind,
        options: item.options,
      });
    } else {
      rawGroups.push({
        title: null,
        items: [
          {
            name: itemLabel(item),
            totalPrice: item.totalPrice,
            quantity: item.quantity,
            kind: item.kind,
            options: item.options,
          },
        ],
      });
    }
  }

  const groups = rawGroups
    .filter((g) => g.title !== null)
    .map((g) => finalizeBurgerGroup(g));

  const misc = rawGroups.find((g) => g.title === null);
  if (misc && misc.items.length > 0) {
    const miscDrinks = misc.items.filter(isDrinkItem);
    const miscOther = misc.items.filter((i) => !isDrinkItem(i));
    if (miscOther.length > 0) {
      groups.push({ title: null, items: mapGroupItems(miscOther) });
    }
    drinkItems.push(...miscDrinks);
  }

  if (groups.length === 0 && items.length > 0 && drinkItems.length === 0) {
    return [{ title: null, items: mapGroupItems(items) }];
  }

  return appendDrinks(groups, drinkItems);
}
