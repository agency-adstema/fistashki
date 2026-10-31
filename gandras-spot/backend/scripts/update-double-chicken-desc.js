const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  await prisma.product.updateMany({
    where: { restaurantId: restaurant.id, slug: "double-chicken-burger" },
    data: {
      description:
        "2 x Pileće meso, 2 x Cheddar sir, Burger sos, Brioche bun",
    },
  });
  console.log("double-chicken-burger description updated");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
