/**
 * Sync sendviči (6) + dodaci za sendviče.
 */
const { PrismaClient, ProductKind } = require("@prisma/client");

const prisma = new PrismaClient();

const OLD_SANDWICH_SLUGS = ["index-sendvic"];

const SANDWICHES = [
  {
    slug: "sendvic-sunka-sir",
    name: "Sendvič sa šunkom i sirom",
    description: "Šunka 100 g i sir",
    price: 480,
    sortOrder: 1,
  },
  {
    slug: "sendvic-sunka-sir-kajgana",
    name: "Šunka sir kajgana",
    description: "Šunka, sir i kajgana",
    price: 520,
    sortOrder: 2,
  },
  {
    slug: "sendvic-srpski",
    name: "Srpski sendvič",
    description: "Kajmak, mladi sir, ajvar, kulen, šunka, kuvano jaje",
    price: 580,
    sortOrder: 3,
  },
  {
    slug: "sendvic-italiano",
    name: "Italiano",
    description: "Pršut, parmezan, pistaci, mozzarella",
    price: 650,
    sortOrder: 4,
  },
  {
    slug: "sendvic-proteinski-klub",
    name: "Proteinski klub sendvič",
    description: "Pileći file na žaru, jaja, slanina, kikiriki sos, posni majonez",
    price: 690,
    sortOrder: 5,
  },
  {
    slug: "sendvic-index",
    name: "Index",
    description: "Šunka, sir, grilovane pečurke, majonez od tartufa",
    price: 550,
    sortOrder: 6,
  },
];

const SANDWICH_EXTRAS = [
  { slug: "sendvic-prsut", name: "Pršut (50 g)", price: 140, sortOrder: 10 },
  { slug: "sendvic-slanina", name: "Slanina (50 g)", price: 130, sortOrder: 11 },
  { slug: "sendvic-suvi-vrat", name: "Suvi vrat (50 g)", price: 140, sortOrder: 12 },
  { slug: "sendvic-kulen", name: "Kulen (50 g)", price: 130, sortOrder: 13 },
  { slug: "sos-majonez", name: "Majonez", price: 50, sortOrder: 14 },
  { slug: "sos-posni-majonez", name: "Posni majonez", price: 50, sortOrder: 15 },
  { slug: "sos-majonez-tartuf", name: "Majonez od tartufa", price: 70, sortOrder: 16 },
  { slug: "sos-sira", name: "Sos od sira", price: 60, sortOrder: 17 },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  const sandwichesCat = await prisma.category.upsert({
    where: {
      restaurantId_slug: { restaurantId: restaurant.id, slug: "sandwiches" },
    },
    create: {
      restaurantId: restaurant.id,
      slug: "sandwiches",
      name: "Sendviči",
      sortOrder: 2,
      isActive: true,
    },
    update: { name: "Sendviči", sortOrder: 2, isActive: true },
  });

  await prisma.product.updateMany({
    where: {
      restaurantId: restaurant.id,
      slug: { in: OLD_SANDWICH_SLUGS },
    },
    data: { isAvailable: false },
  });

  for (const p of SANDWICHES) {
    await prisma.product.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: p.slug },
      },
      create: {
        restaurantId: restaurant.id,
        categoryId: sandwichesCat.id,
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
        categoryId: sandwichesCat.id,
        isAvailable: true,
        sortOrder: p.sortOrder,
      },
    });
  }

  for (const e of SANDWICH_EXTRAS) {
    await prisma.extra.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: e.slug },
      },
      create: {
        restaurantId: restaurant.id,
        slug: e.slug,
        name: e.name,
        price: e.price,
        sortOrder: e.sortOrder,
        isAvailable: true,
      },
      update: {
        name: e.name,
        price: e.price,
        sortOrder: e.sortOrder,
        isAvailable: true,
      },
    });
  }

  console.log(
    "Sendviči:",
    SANDWICHES.map((p) => p.name).join(", "),
    "| Dodaci:",
    SANDWICH_EXTRAS.map((e) => e.name).join(", "),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
