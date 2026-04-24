const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding settings permissions...');

  const permissions = [
    {
      key: 'settings.read',
      name: 'Read Settings',
      description: 'Can view application settings',
    },
    {
      key: 'settings.manage',
      name: 'Manage Settings',
      description: 'Can modify application settings',
    },
  ];

  for (const permission of permissions) {
    try {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: { name: permission.name, description: permission.description },
        create: permission,
      });
      console.log(`✓ Permission ${permission.key} seeded`);
    } catch (error) {
      console.error(`✗ Failed to seed ${permission.key}:`, error.message);
    }
  }

  // Find super_admin role and add settings permissions
  const superAdminRole = await prisma.role.findFirst({
    where: { key: 'super_admin' },
  });

  if (superAdminRole) {
    const settingsPermissions = await prisma.permission.findMany({
      where: { key: { in: ['settings.read', 'settings.manage'] } },
    });

    for (const permission of settingsPermissions) {
      try {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: superAdminRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`✓ Added ${permission.key} to super_admin role`);
      } catch (error) {
        console.error(`✗ Failed to add permission to role:`, error.message);
      }
    }
  } else {
    console.warn('⚠ super_admin role not found');
  }

  console.log('Done seeding permissions!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
