import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: 'users.read',            name: 'Read Users',         description: 'Can view users' },
  { key: 'users.create',          name: 'Create Users',       description: 'Can create users' },
  { key: 'users.update',          name: 'Update Users',       description: 'Can update users' },
  { key: 'users.delete',          name: 'Delete Users',       description: 'Can delete users' },
  { key: 'roles.read',            name: 'Read Roles',         description: 'Can view roles' },
  { key: 'roles.create',          name: 'Create Roles',       description: 'Can create roles' },
  { key: 'roles.update',          name: 'Update Roles',       description: 'Can update roles' },
  { key: 'roles.delete',          name: 'Delete Roles',       description: 'Can delete roles' },
  { key: 'permissions.read',      name: 'Read Permissions',   description: 'Can view permissions' },
  { key: 'permissions.assign',    name: 'Assign Permissions', description: 'Can assign permissions to roles' },
  { key: 'audit_logs.read',       name: 'Read Audit Logs',    description: 'Can view audit logs' },
  { key: 'categories.read',       name: 'Read Categories',    description: 'Can view categories' },
  { key: 'categories.create',     name: 'Create Category',    description: 'Can create categories' },
  { key: 'categories.update',     name: 'Update Category',    description: 'Can update categories' },
  { key: 'categories.delete',     name: 'Delete Category',    description: 'Can delete categories' },
  { key: 'products.read',                name: 'Read Products',              description: 'Can view products' },
  { key: 'products.create',              name: 'Create Product',             description: 'Can create products' },
  { key: 'products.update',              name: 'Update Product',             description: 'Can update products' },
  { key: 'products.delete',              name: 'Delete Product',             description: 'Can delete products' },
  { key: 'customers.read',               name: 'Read Customers',             description: 'Can view customers' },
  { key: 'customers.create',             name: 'Create Customer',            description: 'Can create customers' },
  { key: 'customers.update',             name: 'Update Customer',            description: 'Can update customers' },
  { key: 'customers.delete',             name: 'Delete Customer',            description: 'Can delete customers' },
  { key: 'orders.read',                  name: 'Read Orders',                description: 'Can view orders' },
  { key: 'orders.create',                name: 'Create Order',               description: 'Can create orders' },
  { key: 'orders.update',                name: 'Update Order',               description: 'Can update order status' },
  { key: 'orders.cancel',                name: 'Cancel Order',               description: 'Can cancel orders' },
  { key: 'orders.manage_payment',        name: 'Manage Order Payment',       description: 'Can update payment status' },
  { key: 'orders.manage_fulfillment',    name: 'Manage Order Fulfillment',   description: 'Can update fulfillment status' },
  { key: 'dashboard.read',               name: 'Read Dashboard',             description: 'Can view admin dashboard stats' },
  { key: 'payments.read',                name: 'Read Payments',              description: 'Can view payments' },
  { key: 'payments.create',              name: 'Create Payment',             description: 'Can create payment records' },
  { key: 'payments.mark_paid',           name: 'Mark Payment Paid',          description: 'Can mark a payment as paid' },
  { key: 'payments.mark_failed',         name: 'Mark Payment Failed',        description: 'Can mark a payment as failed' },
  { key: 'payments.refund',              name: 'Refund Payment',             description: 'Can refund a payment' },
  { key: 'shipping_methods.read',        name: 'Read Shipping Methods',      description: 'Can view shipping methods' },
  { key: 'shipping_methods.create',      name: 'Create Shipping Method',     description: 'Can create shipping methods' },
  { key: 'shipping_methods.update',      name: 'Update Shipping Method',     description: 'Can update shipping methods' },
  { key: 'shipping_methods.delete',      name: 'Delete Shipping Method',     description: 'Can delete shipping methods' },
  { key: 'shipments.read',               name: 'Read Shipments',             description: 'Can view shipments' },
  { key: 'shipments.create',             name: 'Create Shipment',            description: 'Can create shipments' },
  { key: 'shipments.update',             name: 'Update Shipment',            description: 'Can update shipment status and tracking' },
  { key: 'shipments.cancel',             name: 'Cancel Shipment',            description: 'Can cancel shipments' },
];

async function main() {
  console.log('Starting seed...');

  const permissions = await Promise.all(
    PERMISSIONS.map((p) =>
      prisma.permission.upsert({
        where: { key: p.key },
        update: {},
        create: p,
      }),
    ),
  );
  console.log(`✓ ${permissions.length} permissions seeded`);

  const superAdminRole = await prisma.role.upsert({
    where: { key: 'super_admin' },
    update: {},
    create: {
      key: 'super_admin',
      name: 'Super Admin',
      description: 'Full unrestricted system access',
    },
  });
  console.log('✓ super_admin role seeded');

  await Promise.all(
    permissions.map((p) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: p.id },
      }),
    ),
  );
  console.log('✓ All permissions assigned to super_admin');

  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });
  console.log('✓ Admin user seeded');

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole.id },
  });
  console.log('✓ super_admin role assigned to admin@example.com');

  console.log('\nSeed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
