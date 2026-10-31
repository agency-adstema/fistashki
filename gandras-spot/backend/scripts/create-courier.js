/**
 * Kreira nalog dostavljača (User COURIER + Driver).
 * VPS: node scripts/create-courier.js email lozinka "Ime" "Prezime" "060..." [isplata]
 */
const { PrismaClient, UserRole, DriverStatus } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const [, , email, password, firstName, lastName, phone, payArg] = process.argv;
  if (!email || !password || !firstName || !phone) {
    console.error(
      'Usage: node scripts/create-courier.js email password "Ime" "Prezime" "060..." [payPerDelivery]',
    );
    process.exit(1);
  }

  const restaurant = await prisma.restaurant.findFirst({ where: { slug: "gandras-spot" } });
  if (!restaurant) throw new Error("Restaurant not found");

  const normalized = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new Error(`User ${normalized} already exists`);

  const passwordHash = await bcrypt.hash(password, 10);
  const payPerDelivery = payArg ? Number(payArg) : undefined;

  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      firstName,
      lastName: lastName || null,
    },
  });

  await prisma.restaurantUser.create({
    data: {
      restaurantId: restaurant.id,
      userId: user.id,
      role: UserRole.COURIER,
    },
  });

  const driver = await prisma.driver.create({
    data: {
      restaurantId: restaurant.id,
      userId: user.id,
      firstName,
      lastName: lastName || null,
      phone,
      payPerDelivery: Number.isFinite(payPerDelivery) ? payPerDelivery : null,
      status: DriverStatus.OFFLINE,
    },
  });

  console.log("Courier created:");
  console.log({ email: normalized, driverId: driver.id, loginUrl: "/dostava/login" });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
