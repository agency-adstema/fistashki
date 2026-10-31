/**
 * Dodaje kolone za courier portal (bez prisma db push na pooleru).
 * VPS: node scripts/migrate-courier-portal.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "RestaurantSettings"
    ADD COLUMN IF NOT EXISTS "courierPayPerDelivery" INTEGER NOT NULL DEFAULT 200;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Driver"
    ADD COLUMN IF NOT EXISTS "userId" TEXT;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Driver"
    ADD COLUMN IF NOT EXISTS "payPerDelivery" INTEGER;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Driver_userId_key'
      ) THEN
        ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_key" UNIQUE ("userId");
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Driver_userId_fkey'
      ) THEN
        ALTER TABLE "Driver"
        ADD CONSTRAINT "Driver_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log("Courier portal migration OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
