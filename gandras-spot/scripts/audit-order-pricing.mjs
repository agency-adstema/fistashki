/**
 * Brza provera obračuna — pokreni: node scripts/audit-order-pricing.mjs
 */

function vatFromGross(gross, taxRate) {
  if (taxRate <= 0 || gross <= 0) return 0;
  return Math.round((gross * taxRate) / (1 + taxRate));
}

function calcOrderAmounts(subtotal, deliveryMethod, settings, discount = 0) {
  const deliveryFee =
    deliveryMethod !== "delivery"
      ? 0
      : settings.freeDeliveryMin > 0 && subtotal >= settings.freeDeliveryMin
        ? 0
        : settings.deliveryFee;
  const gross = Math.max(0, subtotal - discount) + deliveryFee;
  const tax = vatFromGross(gross, settings.taxRate);
  const total = gross;
  return { deliveryFee, tax, total };
}

function backendLineSubtotal(configs, drinkQty, prices) {
  let subtotal = 0;
  for (const line of configs) {
    const pomfrit = line.burgerId.startsWith("pomfrit-");
    const unit = pomfrit
      ? line.sizeId === "veliki"
        ? 350
        : 250
      : prices.products[line.burgerId];
    subtotal += unit;
    for (const id of line.ingredientIds ?? []) subtotal += prices.ingredients[id] ?? 0;
    for (const id of line.extraIds ?? []) subtotal += prices.extras[id] ?? 0;
  }
  for (const [id, qty] of Object.entries(drinkQty)) {
    if (qty > 0) subtotal += (prices.drinks[id] ?? 0) * qty;
  }
  return subtotal;
}

const settings = { deliveryFee: 350, freeDeliveryMin: 0, taxRate: 0.2 };

const prices = {
  products: {
    "double-burger": 890,
    "pomfrit-kecap": 250,
    "sendvic-sunka-sir": 480,
  },
  ingredients: { iceberg: 0 },
  extras: { "extra-cheddar": 100, "ljuti-sos": 80 },
  drinks: { koka: 180 },
};

const scenarios = [
  {
    name: "Double Burger + dostava",
    cartSubtotal: 890,
    delivery: "delivery",
    expectTotal: 1240,
  },
  {
    name: "Double + extra cheddar + dostava",
    cartSubtotal: 990,
    delivery: "delivery",
    expectTotal: 1340,
  },
  {
    name: "Pomfrit veliki + ljuti sos + dostava",
    cartSubtotal: 430,
    delivery: "delivery",
    expectTotal: 780,
  },
  {
    name: "Double Burger — preuzimanje",
    cartSubtotal: 890,
    delivery: "pickup",
    expectTotal: 890,
  },
  {
    name: "Sendvič + piće 2×",
    cartSubtotal: 480 + 360,
    delivery: "pickup",
    expectTotal: 840,
  },
];

let failed = 0;
for (const s of scenarios) {
  const { total } = calcOrderAmounts(s.cartSubtotal, s.delivery, settings);
  const ok = total === s.expectTotal;
  if (!ok) failed++;
  console.log(`${ok ? "OK" : "FAIL"} ${s.name}: ${total} RSD (očekivano ${s.expectTotal})`);
}

const lines = {
  burgerConfigs: [
    { burgerId: "double-burger", ingredientIds: [], extraIds: ["extra-cheddar"] },
    { burgerId: "pomfrit-kecap", ingredientIds: [], extraIds: ["ljuti-sos"], sizeId: "veliki" },
  ],
  drinks: { koka: 1 },
};

const backendSubtotal = backendLineSubtotal(lines.burgerConfigs, lines.drinks, prices);
const frontSubtotal = 990 + 430 + 180;
const match = backendSubtotal === frontSubtotal;
if (!match) failed++;
console.log(
  `${match ? "OK" : "FAIL"} Front/back stavke: front=${frontSubtotal}, back=${backendSubtotal}`,
);

const oldTax = Math.round(1340 * 0.2);
const oldTotal = 1340 + oldTax;
const newTotal = 1340;
console.log(`INFO Stari bug (Double+extra+dostava): ${oldTotal} → novi: ${newTotal}`);

process.exit(failed > 0 ? 1 : 0);
