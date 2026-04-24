-- Add orders.delete permission
INSERT INTO "permissions" ("id", "key", "name", "description", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  'orders.delete',
  'Delete Orders',
  'Permission to permanently delete orders from the system',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "key" = 'orders.delete');

-- Assign orders.delete permission to admin role
INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt")
SELECT 
  gen_random_uuid()::text,
  r."id",
  p."id",
  NOW()
FROM "roles" r
JOIN "permissions" p ON p."key" = 'orders.delete'
WHERE r."key" = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permissions" 
    WHERE "roleId" = r."id" AND "permissionId" = p."id"
  );
