/**
 * Upsert new menu products + disable free delivery.
 * Run on VPS: node -e "..." or via deploy hook.
 */
const { PrismaClient, ProductKind } = require("@prisma/client");

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    slug: "kfc",
    name: "KFC (Korean Fried Chicken)",
    description: "Piletina u korejskom stilu",
    price: 790,
    categorySlug: "burgers",
  },
  {
    slug: "index-sendvic",
    name: "Index sendvič",
    description: "Sendvič preporuka kuće",
    price: 520,
    categorySlug: "sandwiches",
  },
  {
    slug: "komplet-lepinja-rolovana",
    name: "Komplet lepinja sa rolovanom prasetinom",
    description: "Topao komplet sa rolovanom prasetinom",
    price: 780,
    categorySlug: "lepinje",
  },
  {
    slug: "pomfrit-regular",
    name: "Pomfrit",
    description: "Hrskavi pomfrit",
    price: 250,
    categorySlug: "pomfrit",
  },
  {
    slug: "pomfrit-veliki",
    name: "Pomfrit (veliki)",
    description: "Veća porcija",
    price: 350,
    categorySlug: "pomfrit",
  },
];

const CATEGORIES = [
  { slug: "burgers", name: "Burgeri", sortOrder: 1 },
  { slug: "sandwiches", name: "Sendviči", sortOrder: 2 },
  { slug: "lepinje", name: "Komplet lepinje", sortOrder: 3 },
  { slug: "pomfrit", name: "Pomfrit", sortOrder: 4 },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  await prisma.restaurantSettings.update({
    where: { restaurantId: restaurant.id },
    data: { freeDeliveryMin: 0 },
  });

  // Soft-hide pomfrit as extra
  await prisma.extra.updateMany({
    where: { restaurantId: restaurant.id, slug: "pomfrit" },
    data: { isAvailable: false },
  });

  // Rename double cheese
  await prisma.product.updateMany({
    where: { restaurantId: restaurant.id, slug: "double-cheese" },
    data: { name: "Double Burger" },
  });

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

  for (const p of PRODUCTS) {
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
        sortOrder: 50,
      },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: cat?.id,
        isAvailable: true,
      },
    });
  }

  console.log("Menu products upserted, freeDeliveryMin=0");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
