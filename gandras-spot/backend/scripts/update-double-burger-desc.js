const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  await prisma.product.updateMany({
    where: { restaurantId: restaurant.id, slug: "double-burger" },
    data: {
      description:
        "2 x 100 g mix svinjskog i junećeg mesa, 2 x Cheddar sir, Burger sos, Brioche bun",
    },
  });
  console.log("double-burger description updated");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
