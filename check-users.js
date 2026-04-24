const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({ include: { role: true } });
  
  console.log('Users on server:');
  users.forEach(u => {
    console.log(`  - ${u.email} (Role: ${u.role?.name || 'NO ROLE'})`);
  });
}

main().finally(() => p.$disconnect());
