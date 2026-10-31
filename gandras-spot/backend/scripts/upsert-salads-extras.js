/**
 * Sync burger salads (free) and paid extras.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const INGREDIENTS = [
  { slug: "iceberg", name: "Iceberg", sortOrder: 0 },
  { slug: "kupus-jogurt", name: "Kupus sa susamom i grčkim jogurtom", sortOrder: 1 },
  { slug: "paradajz", name: "Paradajz", sortOrder: 2 },
  { slug: "krastavci-sargarepa", name: "Krastavci i šargarepa", sortOrder: 3 },
];

const OLD_INGREDIENTS = ["zelena", "luk", "krastavci", "kupus"];

const EXTRAS = [
  { slug: "extra-slanina", name: "Extra slanina", price: 150, sortOrder: 0 },
  { slug: "extra-cheddar", name: "Extra cheddar", price: 100, sortOrder: 1 },
  { slug: "ljuti-sos", name: "Ljuti sos", price: 80, sortOrder: 2 },
];

const OLD_EXTRAS = [
  "extra-sir",
  "extra-meso",
  "bacon",
  "jalapeno",
  "onion-rings",
  "pomfrit",
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  for (const ing of INGREDIENTS) {
    await prisma.ingredient.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: ing.slug },
      },
      create: {
        restaurantId: restaurant.id,
        slug: ing.slug,
        name: ing.name,
        price: 0,
        sortOrder: ing.sortOrder,
        isAvailable: true,
      },
      update: {
        name: ing.name,
        price: 0,
        sortOrder: ing.sortOrder,
        isAvailable: true,
      },
    });
  }

  await prisma.ingredient.updateMany({
    where: {
      restaurantId: restaurant.id,
      slug: { in: OLD_INGREDIENTS },
    },
    data: { isAvailable: false },
  });

  for (const e of EXTRAS) {
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

  await prisma.extra.updateMany({
    where: {
      restaurantId: restaurant.id,
      slug: { in: OLD_EXTRAS },
    },
    data: { isAvailable: false },
  });

  console.log(
    "Salads:",
    INGREDIENTS.map((i) => i.name).join(", "),
    "| Extras:",
    EXTRAS.map((e) => e.name).join(", "),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
