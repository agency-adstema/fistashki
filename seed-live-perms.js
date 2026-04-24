const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Find or create permissions
  const perm1 = await p.permission.findFirst({
    where: { name: 'calls.read' },
  });

  const perm1Id = perm1?.id || (await p.permission.create({
    data: { name: 'calls.read', key: 'calls.read', description: 'Read call center' },
  })).id;

  const perm2 = await p.permission.findFirst({
    where: { name: 'calls.manage' },
  });

  const perm2Id = perm2?.id || (await p.permission.create({
    data: { name: 'calls.manage', key: 'calls.manage', description: 'Manage calls' },
  })).id;

  // Find super_admin role
  const role = await p.role.findFirst({ where: { name: 'super_admin' } });

  if (role) {
    // Add permissions to role
    await p.rolePermission.create({
      data: { roleId: role.id, permissionId: perm1Id },
    }).catch(() => {});

    await p.rolePermission.create({
      data: { roleId: role.id, permissionId: perm2Id },
    }).catch(() => {});

    console.log('✅ Permissions added for super_admin role');
  } else {
    console.log('❌ super_admin role not found');
  }
}

main().finally(() => p.$disconnect());
