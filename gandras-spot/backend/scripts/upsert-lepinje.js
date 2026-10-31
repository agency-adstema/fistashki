/**
 * Sync Komplet lepinje (3 products).
 */
const { PrismaClient, ProductKind } = require("@prisma/client");

const prisma = new PrismaClient();

const LEPINJE = [
  {
    slug: "komplet-lepinja-prsut",
    name: "Komplet lepinja sa pršutom",
    description: "Topla komplet lepinja sa pršutom",
    price: 750,
    sortOrder: 1,
  },
  {
    slug: "komplet-lepinja-pecenica",
    name: "Komplet lepinja sa pečenicom",
    description: "Topla komplet lepinja sa pečenicom",
    price: 750,
    sortOrder: 2,
  },
  {
    slug: "komplet-lepinja-rolovana",
    name: "Komplet lepinja sa rolovanom prasetinom",
    description: "Topla komplet lepinja sa rolovanom prasetinom",
    price: 780,
    sortOrder: 3,
  },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  const lepinjeCat = await prisma.category.upsert({
    where: {
      restaurantId_slug: { restaurantId: restaurant.id, slug: "lepinje" },
    },
    create: {
      restaurantId: restaurant.id,
      slug: "lepinje",
      name: "Lepinje",
      sortOrder: 3,
      isActive: true,
    },
    update: { name: "Lepinje", sortOrder: 3, isActive: true },
  });

  for (const p of LEPINJE) {
    await prisma.product.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: p.slug },
      },
      create: {
        restaurantId: restaurant.id,
        categoryId: lepinjeCat.id,
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
        categoryId: lepinjeCat.id,
        isAvailable: true,
        sortOrder: p.sortOrder,
      },
    });
  }

  console.log("Lepinje synced:", LEPINJE.map((p) => p.name).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
