const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const perm = await prisma.permission.upsert({
    where: { key: 'orders.delete' },
    update: {},
    create: {
      key: 'orders.delete',
      name: 'Delete Order',
      description: 'Can permanently delete orders (admin only)',
    },
  });
  console.log('Permission created:', perm.key);

  const role = await prisma.role.findUnique({ where: { key: 'super_admin' } });
  if (role) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: { roleId: role.id, permissionId: perm.id },
    });
    console.log('Assigned to super_admin role');
  } else {
    console.log('super_admin role not found');
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
