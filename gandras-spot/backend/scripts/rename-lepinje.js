/**
 * Rename all lepinje to "Komplet lepinja sa …"
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const LEPINJE = [
  {
    slug: "komplet-lepinja-prsut",
    name: "Komplet lepinja sa pršutom",
    description: "Topla komplet lepinja sa pršutom",
  },
  {
    slug: "komplet-lepinja-pecenica",
    name: "Komplet lepinja sa pečenicom",
    description: "Topla komplet lepinja sa pečenicom",
  },
  {
    slug: "komplet-lepinja-rolovana",
    name: "Komplet lepinja sa rolovanom prasetinom",
    description: "Topla komplet lepinja sa rolovanom prasetinom",
  },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  for (const p of LEPINJE) {
    const result = await prisma.product.updateMany({
      where: { restaurantId: restaurant.id, slug: p.slug },
      data: { name: p.name, description: p.description },
    });
    console.log(`${p.slug}: ${result.count} → ${p.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
