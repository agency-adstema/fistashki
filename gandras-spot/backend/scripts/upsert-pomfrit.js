/**
 * Sync pomfrit menu (4 variants) + disable legacy pomfrit slugs.
 */
const { PrismaClient, ProductKind } = require("@prisma/client");

const prisma = new PrismaClient();

const OLD_POMFRIT_SLUGS = ["pomfrit-regular", "pomfrit-veliki", "pomfrit"];

const POMFRIT = [
  {
    slug: "pomfrit-kecap",
    name: "Pomfrit sa kečapom",
    description: "Hrskavi pomfrit sa kečapom",
    price: 250,
    sortOrder: 1,
  },
  {
    slug: "pomfrit-burger-sos",
    name: "Pomfrit sa burger sosom",
    description: "Hrskavi pomfrit sa burger sosom",
    price: 250,
    sortOrder: 2,
  },
  {
    slug: "pomfrit-tartufi",
    name: "Pomfrit sa tartufima i parmezanom",
    description: "Pomfrit sa tartufima i parmezanom",
    price: 250,
    sortOrder: 3,
  },
  {
    slug: "pomfrit-sir-sos",
    name: "Pomfrit sa sosom od sira",
    description: "Hrskavi pomfrit sa sosom od sira",
    price: 250,
    sortOrder: 4,
  },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  const pomfritCat = await prisma.category.upsert({
    where: {
      restaurantId_slug: { restaurantId: restaurant.id, slug: "pomfrit" },
    },
    create: {
      restaurantId: restaurant.id,
      slug: "pomfrit",
      name: "Pomfrit",
      sortOrder: 4,
      isActive: true,
    },
    update: { name: "Pomfrit", sortOrder: 4, isActive: true },
  });

  await prisma.product.updateMany({
    where: {
      restaurantId: restaurant.id,
      slug: { in: OLD_POMFRIT_SLUGS },
    },
    data: { isAvailable: false },
  });

  for (const p of POMFRIT) {
    await prisma.product.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: p.slug },
      },
      create: {
        restaurantId: restaurant.id,
        categoryId: pomfritCat.id,
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
        categoryId: pomfritCat.id,
        isAvailable: true,
        sortOrder: p.sortOrder,
      },
    });
  }

  console.log("Pomfrit synced:", POMFRIT.map((p) => p.name).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
