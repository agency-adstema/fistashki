const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  await prisma.product.updateMany({
    where: { restaurantId: restaurant.id, slug: "chicken-burger" },
    data: {
      description: "Pileće meso, Cheddar sir, Burger sos, Brioche bun",
    },
  });
  console.log("chicken-burger description updated");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
