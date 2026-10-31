/**
 * Sync product.description = composition lines (admin "sastav" field).
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const COMPOSITIONS = {
  "single-burger": [
    "100 g mix svinjskog i junećeg mesa",
    "Cheddar sir",
    "Burger sos",
    "Brioche bun",
  ],
  "double-burger": [
    "2 x 100 g mix svinjskog i junećeg mesa",
    "2 x Cheddar sir",
    "Burger sos",
    "Brioche bun",
  ],
  "chicken-burger": ["Pileće meso", "Cheddar sir", "Burger sos", "Brioche bun"],
  "double-chicken-burger": [
    "2 x Pileće meso",
    "2 x Cheddar sir",
    "Burger sos",
    "Brioche bun",
  ],
  "vege-posno": [
    "Vege burger 100 g",
    "Posni burger sos",
    "Biljni sir",
    "Brioche / posni bun",
  ],
  "sendvic-sunka-sir": ["Šunka 100 g", "Sir", "Lepinja / hleb"],
  "sendvic-sunka-sir-kajgana": ["Šunka", "Sir", "Kajgana", "Lepinja / hleb"],
  "sendvic-srpski": [
    "Kajmak",
    "Mladi sir",
    "Ajvar",
    "Kulen",
    "Šunka",
    "Kuvano jaje",
    "Lepinja / hleb",
  ],
  "sendvic-italiano": [
    "Pršut",
    "Parmezan",
    "Pistaci",
    "Mozzarella",
    "Lepinja / hleb",
  ],
  "sendvic-proteinski-klub": [
    "Pileći file na žaru",
    "Jaja",
    "Slanina",
    "Kikiriki sos",
    "Posni majonez",
    "Lepinja / hleb",
  ],
  "sendvic-index": [
    "Šunka",
    "Sir",
    "Grilovane pečurke",
    "Majonez od tartufa",
    "Lepinja / hleb",
  ],
  "komplet-lepinja-prsut": [
    "Lepinja",
    "Pršut",
    "Jaje",
    "Kajmak / majonez",
    "Luk",
  ],
  "komplet-lepinja-pecenica": [
    "Lepinja",
    "Pečenica",
    "Jaje",
    "Kajmak / majonez",
    "Luk",
  ],
  "komplet-lepinja-rolovana": [
    "Lepinja",
    "Rolovana prasetina",
    "Jaje",
    "Kajmak / majonez",
    "Luk",
  ],
  "pomfrit-kecap": ["Pomfrit", "Kečap"],
  "pomfrit-burger-sos": ["Pomfrit", "Burger sos"],
  "pomfrit-tartufi": ["Pomfrit", "Tartufi", "Parmezan"],
  "pomfrit-sir-sos": ["Pomfrit", "Sos od sira"],
};

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: "gandras-spot" },
  });
  if (!restaurant) throw new Error("Restaurant not found");

  for (const [slug, lines] of Object.entries(COMPOSITIONS)) {
    const description = lines.join("\n");
    const r = await prisma.product.updateMany({
      where: { restaurantId: restaurant.id, slug },
      data: { description },
    });
    if (r.count) console.log("updated", slug);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
