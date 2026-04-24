const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  try {
    // Try to select aiCallScript - if column doesn't exist in client, will throw
    const products = await p.product.findMany({
      take: 1,
      select: { id: true, name: true, aiCallScript: true }
    });
    console.log('✅ aiCallScript EXISTS in Prisma client and DB');
    console.log('Products sample:', products[0]);
  } catch (e) {
    console.log('❌ ERROR:', e.message);
  } finally {
    await p.$disconnect();
  }
}
check();
