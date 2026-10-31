/**
 * Assign correct shop categories + seed imageUrl from known static paths when empty.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const BY_CATEGORY = {
  burgers: [
    { slug: "single-burger", image: "/images/classic-burger.png" },
    { slug: "double-burger", image: "/images/double-cheese-burger.png" },
    { slug: "chicken-burger", image: "/images/chicken-crunch-burger.png" },
    { slug: "double-chicken-burger", image: "/images/chicken-crunch-burger.png" },
    { slug: "vege-posno", image: "/images/bbq-smash-burger.png" },
  ],
  sandwiches: [
    { slug: "sendvic-sunka-sir", image: "/images/sandwich.png" },
    { slug: "sendvic-sunka-sir-kajgana", image: "/images/sandwich.png" },
    { slug: "sendvic-srpski", image: "/images/sandwich.png" },
    { slug: "sendvic-italiano", image: "/images/sandwich.png" },
    { slug: "sendvic-proteinski-klub", image: "/images/sandwich.png" },
    { slug: "sendvic-index", image: "/images/sandwich.png" },
  ],
  lepinje: [
    { slug: "komplet-lepinja-prsut", image: "/images/lepinja-prsut.png" },
    { slug: "komplet-lepinja-pecenica", image: "/images/lepinja-pecenica.png" },
    { slug: "komplet-lepinja-rolovana", image: "/images/lepinja-rolovana.png" },
  ],
  pomfrit: [
    { slug: "pomfrit-kecap", image: "/images/pomfrit.png" },
    { slug: "pomfrit-burger-sos", image: "/images/pomfrit.png" },
    { slug: "pomfrit-tartufi", image: "/images/pomfrit.png" },
    { slug: "pomfrit-sir-sos", image: "/images/pomfrit.png" },
  ],
};

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  for (const [catSlug, items] of Object.entries(BY_CATEGORY)) {
    const cat = await prisma.category.upsert({
      where: {
        restaurantId_slug: { restaurantId: restaurant.id, slug: catSlug },
      },
      create: {
        restaurantId: restaurant.id,
        slug: catSlug,
        name:
          catSlug === "burgers"
            ? "Burgeri"
            : catSlug === "sandwiches"
              ? "Sendviči"
              : catSlug === "lepinje"
                ? "Lepinje"
                : "Pomfrit",
        sortOrder:
          catSlug === "burgers" ? 1 : catSlug === "sandwiches" ? 2 : catSlug === "lepinje" ? 3 : 4,
        isActive: true,
      },
      update: { isActive: true },
    });

    for (const item of items) {
      const existing = await prisma.product.findUnique({
        where: {
          restaurantId_slug: { restaurantId: restaurant.id, slug: item.slug },
        },
      });
      if (!existing) {
        console.log("skip missing", item.slug);
        continue;
      }
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          categoryId: cat.id,
          imageUrl: existing.imageUrl || item.image,
        },
      });
      console.log("synced", item.slug, "→", catSlug);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
