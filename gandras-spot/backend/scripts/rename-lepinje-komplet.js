/**
 * Rename all lepinje to "Komplet lepinja sa …"
 * Usage: node scripts/rename-lepinje-komplet.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const RENAMES = [
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
  for (const row of RENAMES) {
    const result = await prisma.product.updateMany({
      where: { slug: row.slug },
      data: { name: row.name, description: row.description },
    });
    console.log(`${row.slug}: ${result.count} updated → ${row.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
