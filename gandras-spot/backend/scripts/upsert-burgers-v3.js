/**
 * Sync Gandras burger menu (5 burgers) + sides.
 * Run on VPS from /var/www/gandras-spot-api
 */
const { PrismaClient, ProductKind } = require("@prisma/client");

const prisma = new PrismaClient();

const OLD_BURGER_SLUGS = [
  "classic",
  "double-cheese",
  "bbq-smash",
  "chicken-crunch",
  "kfc",
];

const BURGERS = [
  {
    slug: "single-burger",
    name: "Single Burger",
    description: "100 g mix svinjskog i junećeg mesa, cheddar, burger sos, brioche bun",
    price: 650,
    sortOrder: 1,
  },
  {
    slug: "double-burger",
    name: "Double Burger",
    description:
      "2 x 100 g mix svinjskog i junećeg mesa, 2 x Cheddar sir, Burger sos, Brioche bun",
    price: 890,
    sortOrder: 2,
  },
  {
    slug: "chicken-burger",
    name: "Chicken Burger",
    description: "Pileće meso, Cheddar sir, Burger sos, Brioche bun",
    price: 690,
    sortOrder: 3,
  },
  {
    slug: "double-chicken-burger",
    name: "Double Chicken Burger",
    description: "2 x Pileće meso, 2 x Cheddar sir, Burger sos, Brioche bun",
    price: 890,
    sortOrder: 4,
  },
  {
    slug: "vege-posno",
    name: "Vege / Posno",
    description: "Vege burger 100 g, posni burger sos, biljni sir",
    price: 650,
    sortOrder: 5,
  },
];

const OTHER = [
  {
    slug: "sendvic-sunka-sir",
    name: "Sendvič sa šunkom i sirom",
    description: "Šunka 100 g i sir",
    price: 480,
    categorySlug: "sandwiches",
    sortOrder: 1,
  },
  {
    slug: "sendvic-sunka-sir-kajgana",
    name: "Šunka sir kajgana",
    description: "Šunka, sir i kajgana",
    price: 520,
    categorySlug: "sandwiches",
    sortOrder: 2,
  },
  {
    slug: "sendvic-srpski",
    name: "Srpski sendvič",
    description: "Kajmak, mladi sir, ajvar, kulen, šunka, kuvano jaje",
    price: 580,
    categorySlug: "sandwiches",
    sortOrder: 3,
  },
  {
    slug: "sendvic-italiano",
    name: "Italiano",
    description: "Pršut, parmezan, pistaci, mozzarella",
    price: 650,
    categorySlug: "sandwiches",
    sortOrder: 4,
  },
  {
    slug: "sendvic-proteinski-klub",
    name: "Proteinski klub sendvič",
    description: "Pileći file na žaru, jaja, slanina, kikiriki sos, posni majonez",
    price: 690,
    categorySlug: "sandwiches",
    sortOrder: 5,
  },
  {
    slug: "sendvic-index",
    name: "Index",
    description: "Šunka, sir, grilovane pečurke, majonez od tartufa",
    price: 550,
    categorySlug: "sandwiches",
    sortOrder: 6,
  },
  {
    slug: "komplet-lepinja-prsut",
    name: "Komplet lepinja sa pršutom",
    description: "Topla komplet lepinja sa pršutom",
    price: 750,
    categorySlug: "lepinje",
    sortOrder: 1,
  },
  {
    slug: "komplet-lepinja-pecenica",
    name: "Komplet lepinja sa pečenicom",
    description: "Topla komplet lepinja sa pečenicom",
    price: 750,
    categorySlug: "lepinje",
    sortOrder: 2,
  },
  {
    slug: "komplet-lepinja-rolovana",
    name: "Komplet lepinja sa rolovanom prasetinom",
    description: "Topla komplet lepinja sa rolovanom prasetinom",
    price: 780,
    categorySlug: "lepinje",
    sortOrder: 3,
  },
  {
    slug: "pomfrit-kecap",
    name: "Pomfrit sa kečapom",
    description: "Hrskavi pomfrit sa kečapom",
    price: 250,
    categorySlug: "pomfrit",
    sortOrder: 1,
  },
  {
    slug: "pomfrit-burger-sos",
    name: "Pomfrit sa burger sosom",
    description: "Hrskavi pomfrit sa burger sosom",
    price: 250,
    categorySlug: "pomfrit",
    sortOrder: 2,
  },
  {
    slug: "pomfrit-tartufi",
    name: "Pomfrit sa tartufima i parmezanom",
    description: "Pomfrit sa tartufima i parmezanom",
    price: 250,
    categorySlug: "pomfrit",
    sortOrder: 3,
  },
  {
    slug: "pomfrit-sir-sos",
    name: "Pomfrit sa sosom od sira",
    description: "Hrskavi pomfrit sa sosom od sira",
    price: 250,
    categorySlug: "pomfrit",
    sortOrder: 4,
  },
];

const CATEGORIES = [
  { slug: "burgers", name: "Burgeri", sortOrder: 1 },
  { slug: "sandwiches", name: "Sendviči", sortOrder: 2 },
  { slug: "lepinje", name: "Lepinje", sortOrder: 3 },
  { slug: "pomfrit", name: "Pomfrit", sortOrder: 4 },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: cat.slug },
      },
      create: {
        restaurantId: restaurant.id,
        slug: cat.slug,
        name: cat.name,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      update: { name: cat.name, sortOrder: cat.sortOrder, isActive: true },
    });
  }

  const burgersCat = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id, slug: "burgers" },
  });

  await prisma.product.updateMany({
    where: { restaurantId: restaurant.id, slug: { in: OLD_BURGER_SLUGS } },
    data: { isAvailable: false },
  });

  for (const p of BURGERS) {
    await prisma.product.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: p.slug },
      },
      create: {
        restaurantId: restaurant.id,
        categoryId: burgersCat?.id,
        kind: ProductKind.BURGER,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        isAvailable: true,
        sortOrder: p.sortOrder,
      },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: burgersCat?.id,
        isAvailable: true,
        sortOrder: p.sortOrder,
      },
    });
  }

  for (const p of OTHER) {
    const cat = await prisma.category.findFirst({
      where: { restaurantId: restaurant.id, slug: p.categorySlug },
    });
    await prisma.product.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: p.slug },
      },
      create: {
        restaurantId: restaurant.id,
        categoryId: cat?.id,
        kind: ProductKind.BURGER,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        isAvailable: true,
        sortOrder: p.sortOrder,
      },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: cat?.id,
        isAvailable: true,
        sortOrder: p.sortOrder,
      },
    });
  }

  console.log("Burgers synced:", BURGERS.map((b) => b.name).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
