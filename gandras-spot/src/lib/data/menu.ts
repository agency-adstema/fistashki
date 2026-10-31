import type { MenuCategoryId, MenuItem, FriesSizeId } from "@/lib/types";
import { FRIES_SIZES } from "@/lib/types";

export const BURGERS: MenuItem[] = [
  {
    id: "single-burger",
    name: "Single Burger",
    description: "100 g mix svinjskog i junećeg mesa, cheddar, burger sos, brioche bun",
    composition: [
      "100 g mix svinjskog i junećeg mesa",
      "Cheddar sir",
      "Burger sos",
      "Brioche bun",
    ],
    price: 650,
    image: "/images/classic-burger.png",
    category: "burger",
    menuCategory: "burgers",
  },
  {
    id: "double-burger",
    name: "Double Burger",
    description:
      "2 x 100 g mix svinjskog i junećeg mesa\n2 x Cheddar sir\nBurger sos\nBrioche bun",
    composition: [
      "2 x 100 g mix svinjskog i junećeg mesa",
      "2 x Cheddar sir",
      "Burger sos",
      "Brioche bun",
    ],
    price: 890,
    image: "/images/double-cheese-burger.png",
    category: "burger",
    menuCategory: "burgers",
  },
  {
    id: "chicken-burger",
    name: "Chicken Burger",
    description: "Pileće meso\nCheddar sir\nBurger sos\nBrioche bun",
    composition: [
      "Pileće meso",
      "Cheddar sir",
      "Burger sos",
      "Brioche bun",
    ],
    price: 690,
    image: "/images/chicken-crunch-burger.png",
    category: "burger",
    menuCategory: "burgers",
  },
  {
    id: "double-chicken-burger",
    name: "Double Chicken Burger",
    description: "2 x Pileće meso\n2 x Cheddar sir\nBurger sos\nBrioche bun",
    composition: [
      "2 x Pileće meso",
      "2 x Cheddar sir",
      "Burger sos",
      "Brioche bun",
    ],
    price: 890,
    image: "/images/chicken-crunch-burger.png",
    category: "burger",
    menuCategory: "burgers",
  },
  {
    id: "vege-posno",
    name: "Vege / Posno",
    description: "Vege burger 100 g, posni burger sos, biljni sir",
    composition: [
      "Vege burger 100 g",
      "Posni burger sos",
      "Biljni sir",
      "Brioche / posni bun",
    ],
    price: 650,
    image: "/images/bbq-smash-burger.png",
    category: "burger",
    menuCategory: "burgers",
  },
];

export const SANDWICHES: MenuItem[] = [
  {
    id: "sendvic-sunka-sir",
    name: "Sendvič sa šunkom i sirom",
    description: "Šunka 100 g i sir",
    composition: ["Šunka 100 g", "Sir", "Lepinja / hleb"],
    price: 480,
    image: "/images/sandwich.png",
    category: "sandwich",
    menuCategory: "sandwiches",
  },
  {
    id: "sendvic-sunka-sir-kajgana",
    name: "Šunka sir kajgana",
    description: "Šunka, sir i kajgana",
    composition: ["Šunka", "Sir", "Kajgana", "Lepinja / hleb"],
    price: 520,
    image: "/images/sandwich.png",
    category: "sandwich",
    menuCategory: "sandwiches",
  },
  {
    id: "sendvic-srpski",
    name: "Srpski sendvič",
    description: "Kajmak, mladi sir, ajvar, kulen, šunka, kuvano jaje",
    composition: [
      "Kajmak",
      "Mladi sir",
      "Ajvar",
      "Kulen",
      "Šunka",
      "Kuvano jaje",
      "Lepinja / hleb",
    ],
    price: 580,
    image: "/images/sandwich.png",
    category: "sandwich",
    menuCategory: "sandwiches",
  },
  {
    id: "sendvic-italiano",
    name: "Italiano",
    description: "Pršut, parmezan, pistaci, mozzarella",
    composition: ["Pršut", "Parmezan", "Pistaci", "Mozzarella", "Lepinja / hleb"],
    price: 650,
    image: "/images/sandwich.png",
    category: "sandwich",
    menuCategory: "sandwiches",
  },
  {
    id: "sendvic-proteinski-klub",
    name: "Proteinski klub sendvič",
    description: "Pileći file na žaru, jaja, slanina, kikiriki sos, posni majonez",
    composition: [
      "Pileći file na žaru",
      "Jaja",
      "Slanina",
      "Kikiriki sos",
      "Posni majonez",
      "Lepinja / hleb",
    ],
    price: 690,
    image: "/images/sandwich.png",
    category: "sandwich",
    menuCategory: "sandwiches",
  },
  {
    id: "sendvic-index",
    name: "Index",
    description: "Šunka, sir, grilovane pečurke, majonez od tartufa",
    composition: ["Šunka", "Sir", "Grilovane pečurke", "Majonez od tartufa", "Lepinja / hleb"],
    price: 550,
    image: "/images/sandwich.png",
    category: "sandwich",
    menuCategory: "sandwiches",
  },
];

export const LEPINJE: MenuItem[] = [
  {
    id: "komplet-lepinja-prsut",
    name: "Komplet lepinja sa pršutom",
    description: "Topla komplet lepinja sa pršutom",
    composition: ["Lepinja", "Pršut", "Jaje", "Kajmak / majonez", "Luk"],
    price: 750,
    image: "/images/lepinja-prsut.png",
    category: "lepinja",
    menuCategory: "lepinje",
  },
  {
    id: "komplet-lepinja-pecenica",
    name: "Komplet lepinja sa pečenicom",
    description: "Topla komplet lepinja sa pečenicom",
    composition: ["Lepinja", "Pečenica", "Jaje", "Kajmak / majonez", "Luk"],
    price: 750,
    image: "/images/lepinja-pecenica.png",
    category: "lepinja",
    menuCategory: "lepinje",
  },
  {
    id: "komplet-lepinja-rolovana",
    name: "Komplet lepinja sa rolovanom prasetinom",
    description: "Topla komplet lepinja sa rolovanom prasetinom",
    composition: [
      "Lepinja",
      "Rolovana prasetina",
      "Jaje",
      "Kajmak / majonez",
      "Luk",
    ],
    price: 780,
    image: "/images/lepinja-rolovana.png",
    category: "lepinja",
    menuCategory: "lepinje",
  },
];

export const FRIES: MenuItem[] = [
  {
    id: "pomfrit-kecap",
    name: "Pomfrit sa kečapom",
    description: "Hrskavi pomfrit sa kečapom",
    composition: ["Pomfrit", "Kečap"],
    price: FRIES_SIZES.mali.price,
    image: "/images/pomfrit.png",
    category: "side",
    menuCategory: "pomfrit",
  },
  {
    id: "pomfrit-burger-sos",
    name: "Pomfrit sa burger sosom",
    description: "Hrskavi pomfrit sa burger sosom",
    composition: ["Pomfrit", "Burger sos"],
    price: FRIES_SIZES.mali.price,
    image: "/images/pomfrit.png",
    category: "side",
    menuCategory: "pomfrit",
  },
  {
    id: "pomfrit-tartufi",
    name: "Pomfrit sa tartufima i parmezanom",
    description: "Pomfrit sa tartufima i parmezanom",
    composition: ["Pomfrit", "Tartufi", "Parmezan"],
    price: FRIES_SIZES.mali.price,
    image: "/images/pomfrit.png",
    category: "side",
    menuCategory: "pomfrit",
  },
  {
    id: "pomfrit-sir-sos",
    name: "Pomfrit sa sosom od sira",
    description: "Hrskavi pomfrit sa sosom od sira",
    composition: ["Pomfrit", "Sos od sira"],
    price: FRIES_SIZES.mali.price,
    image: "/images/pomfrit.png",
    category: "side",
    menuCategory: "pomfrit",
  },
];

/** Svi proizvodi iz menija (za korpu / lookup) */
export const PRODUCTS: MenuItem[] = [...BURGERS, ...SANDWICHES, ...LEPINJE, ...FRIES];

export const MENU_CATEGORIES: {
  id: MenuCategoryId;
  name: string;
  image: string;
  description: string;
}[] = [
  {
    id: "burgers",
    name: "Burgeri",
    image: "/images/double-cheese-burger.png",
    description: "Smash, classic, chicken…",
  },
  {
    id: "sandwiches",
    name: "Sendviči",
    image: "/images/sandwich.png",
    description: "Index i ostali sendviči",
  },
  {
    id: "lepinje",
    name: "Kompleks lepinje",
    image: "/images/lepinja-prsut.png",
    description: "Tople lepinje sa dodacima",
  },
  {
    id: "pomfrit",
    name: "Pomfrit",
    image: "/images/pomfrit.png",
    description: "Hrskavi prilog",
  },
];

export const SALADS: MenuItem[] = [
  { id: "iceberg", name: "Iceberg", price: 0, image: "", category: "salad" },
  {
    id: "kupus-jogurt",
    name: "Kupus sa susamom i grčkim jogurtom",
    price: 0,
    image: "",
    category: "salad",
  },
  { id: "paradajz", name: "Paradajz", price: 0, image: "", category: "salad" },
  {
    id: "krastavci-sargarepa",
    name: "Krastavci i šargarepa",
    price: 0,
    image: "",
    category: "salad",
  },
];

/** Preporučena salata po burgeru (samo oznaka u UI) */
export const RECOMMENDED_SALAD_BY_BURGER: Record<string, string> = {
  "single-burger": "iceberg",
  "double-burger": "iceberg",
  "chicken-burger": "kupus-jogurt",
  "vege-posno": "kupus-jogurt",
  "double-chicken-burger": "krastavci-sargarepa",
  kfc: "krastavci-sargarepa",
};

export function getRecommendedSaladId(productId: string): string {
  return RECOMMENDED_SALAD_BY_BURGER[productId] ?? "iceberg";
}

/** Plaćeni dodaci za burgere */
export const BURGER_EXTRAS: MenuItem[] = [
  { id: "extra-slanina", name: "Extra slanina", price: 150, image: "", category: "extra" },
  { id: "extra-cheddar", name: "Extra cheddar", price: 100, image: "", category: "extra" },
  { id: "ljuti-sos", name: "Ljuti sos", price: 80, image: "", category: "extra" },
];

/** Mesni dodaci za sendviče (50 g) */
export const SANDWICH_MEAT_EXTRAS: MenuItem[] = [
  { id: "sendvic-prsut", name: "Pršut (50 g)", price: 140, image: "", category: "extra" },
  { id: "sendvic-slanina", name: "Slanina (50 g)", price: 130, image: "", category: "extra" },
  { id: "sendvic-suvi-vrat", name: "Suvi vrat (50 g)", price: 140, image: "", category: "extra" },
  { id: "sendvic-kulen", name: "Kulen (50 g)", price: 130, image: "", category: "extra" },
];

/** Sosevi za sendviče */
export const SANDWICH_SAUCE_EXTRAS: MenuItem[] = [
  { id: "sos-majonez", name: "Majonez", price: 50, image: "", category: "extra" },
  { id: "sos-posni-majonez", name: "Posni majonez", price: 50, image: "", category: "extra" },
  { id: "sos-majonez-tartuf", name: "Majonez od tartufa", price: 70, image: "", category: "extra" },
  { id: "sos-sira", name: "Sos od sira", price: 60, image: "", category: "extra" },
];

export const BURGER_EXTRA_IDS = BURGER_EXTRAS.map((e) => e.id);
export const SANDWICH_MEAT_EXTRA_IDS = SANDWICH_MEAT_EXTRAS.map((e) => e.id);
export const SANDWICH_SAUCE_EXTRA_IDS = [...SANDWICH_SAUCE_EXTRAS.map((e) => e.id), "ljuti-sos"];
export const SANDWICH_EXTRA_IDS = [...SANDWICH_MEAT_EXTRA_IDS, ...SANDWICH_SAUCE_EXTRA_IDS];

/** Svi dodaci (API merge) */
export const EXTRAS: MenuItem[] = [
  ...BURGER_EXTRAS,
  ...SANDWICH_MEAT_EXTRAS,
  ...SANDWICH_SAUCE_EXTRAS,
];

export function extrasForCategory(
  category: MenuCategoryId,
  allExtras: MenuItem[],
): { meat: MenuItem[]; sauces: MenuItem[]; all: MenuItem[] } {
  if (category === "burgers") {
    const all = allExtras.filter((e) => BURGER_EXTRA_IDS.includes(e.id));
    return { meat: [], sauces: [], all };
  }
  if (category === "sandwiches") {
    const meat = allExtras.filter((e) => SANDWICH_MEAT_EXTRA_IDS.includes(e.id));
    const sauces = allExtras.filter((e) => SANDWICH_SAUCE_EXTRA_IDS.includes(e.id));
    return { meat, sauces, all: [...meat, ...sauces] };
  }
  if (category === "pomfrit") {
    const all = allExtras.filter((e) => e.id === "ljuti-sos");
    return { meat: [], sauces: all, all };
  }
  return { meat: [], sauces: [], all: [] };
}

export function isExtraAllowedForCategory(category: MenuCategoryId, extraId: string): boolean {
  if (category === "burgers") return BURGER_EXTRA_IDS.includes(extraId);
  if (category === "sandwiches") return SANDWICH_EXTRA_IDS.includes(extraId);
  if (category === "pomfrit") return extraId === "ljuti-sos";
  return false;
}

export const DRINKS: MenuItem[] = [
  {
    id: "coca-cola",
    name: "Coca Cola",
    price: 180,
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop",
    category: "drink",
  },
  {
    id: "fanta",
    name: "Fanta",
    price: 180,
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=200&h=200&fit=crop",
    category: "drink",
  },
  {
    id: "sprite",
    name: "Sprite",
    price: 180,
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200&h=200&fit=crop",
    category: "drink",
  },
  {
    id: "voda",
    name: "Voda",
    price: 120,
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=200&fit=crop",
    category: "drink",
  },
];

/** @deprecated bread removed from order flow — kept empty for admin/API compat */
export const BREAD_TYPES: MenuItem[] = [];

export const POPULAR_BURGERS = BURGERS;

/** Početna sekcija „Najpopularniji” — tačno 4 stavke */
export const HOME_FEATURED: { id: string; displayName?: string }[] = [
  { id: "double-burger" },
  { id: "double-chicken-burger", displayName: "Double Chicken" },
  { id: "komplet-lepinja-prsut", displayName: "Komplet lepinja sa pršutom" },
  { id: "vege-posno", displayName: "Vegan Burger" },
];

export function getHomeFeaturedItems(
  catalog: MenuItem[] = [...BURGERS, ...LEPINJE],
): MenuItem[] {
  return HOME_FEATURED.flatMap((entry) => {
    const item = catalog.find((p) => p.id === entry.id);
    if (!item) return [];
    return [{ ...item, name: entry.displayName ?? item.name }];
  });
}

export const RESTAURANT = {
  name: "Gandras Spot",
  phone: "060 077 6912",
  email: "info@gandrasspot.rs",
  address: "Pijaca u lancima 4, Sombor 25000",
  hours: "Pon – Ned: 10:00 – 24:00",
  pib: "114210380",
  mb: "67401581",
  freeDeliveryMin: 0,
  deliveryFee: 350,
  taxRate: 0.2,
  social: {
    instagram: "https://www.instagram.com/gandras_spot/",
    facebook: "/",
    tiktok: "/",
  },
};

export const ABOUT = {
  intro:
    "Gandras Spot je burger restoran iz Sombora posvećen pravom, nezaboravnom ukusu. Spajamo domaću toplinu i uličnu kulturu burgera u svaki zalogaj — bez kompromisa po pitanju kvaliteta.",
  whatWeDo:
    "Pravimo smash i klasične burgere od 100% junećeg mesa, pečemo peciva svakog dana i pripremamo sve na licu mesta. Nudimo brzu dostavu, poručivanje online i uživanje u našem prostoru — uvek sveže, uvek puno ukusa.",
  experience:
    "Od 2016. godine gradimo reputaciju mesta gde se vraćaš po isti savršen burger. Naš tim kuvara svakodnevno usavršava recepte, a hiljade zadovoljnih gostiju potvrđuju da smo na pravom putu.",
  stats: [
    { value: "8+", label: "Godina iskustva" },
    { value: "50k+", label: "Poručeno burgera" },
    { value: "100%", label: "Sveži sastojci" },
  ],
};

export function productsForCategory(category: MenuCategoryId): MenuItem[] {
  return PRODUCTS.filter((p) => p.menuCategory === category);
}

export function formatFriesSizeLabel(size: FriesSizeId): string {
  const s = FRIES_SIZES[size];
  return `${s.label} (${s.grams} g)`;
}

export function getFriesLinePrice(size: FriesSizeId = "mali"): number {
  return FRIES_SIZES[size].price;
}
