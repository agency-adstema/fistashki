import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient, ProductStatus, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('Admin Ops (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let accessToken: string;
  let adminUserId: string;

  let customerId: string;
  let orderId: string;

  let orderNoteId: string;
  let customerNoteId: string;
  let tagId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const permissions = [
      'order_notes.read', 'order_notes.create', 'order_notes.update', 'order_notes.delete',
      'customer_notes.read', 'customer_notes.create', 'customer_notes.update', 'customer_notes.delete',
      'order_tags.read', 'order_tags.create', 'order_tags.update', 'order_tags.delete',
      'orders.assign', 'orders.set_priority', 'orders.timeline.read',
      'orders.create', 'orders.read',
      'customers.create', 'customers.read',
    ];

    const seededPermissions = await Promise.all(
      permissions.map((key) =>
        prisma.permission.upsert({
          where: { key },
          update: {},
          create: { key, name: key, description: key },
        }),
      ),
    );

    const role = await prisma.role.upsert({
      where: { key: 'e2e_admin_ops' },
      update: {},
      create: { key: 'e2e_admin_ops', name: 'E2E Admin Ops' },
    });

    await Promise.all(
      seededPermissions.map((p) =>
        prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
          update: {},
          create: { roleId: role.id, permissionId: p.id },
        }),
      ),
    );

    const passwordHash = await bcrypt.hash('Test123!', 12);
    const user = await prisma.user.upsert({
      where: { email: 'e2e-admin-ops@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'e2e-admin-ops@example.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'Ops',
        isActive: true,
      },
    });
    adminUserId = user.id;

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'e2e-admin-ops@example.com', password: 'Test123!' })
      .expect(200);

    accessToken = loginRes.body?.data?.accessToken;

    // Seed customer
    const customer = await prisma.customer.create({
      data: {
        email: `admin-ops-cust-${Date.now()}@example.com`,
        firstName: 'Admin',
        lastName: 'OpsCust',
        isActive: true,
      },
    });
    customerId = customer.id;

    // Seed product + order
    const product = await prisma.product.create({
      data: {
        name: `AdminOps Product ${Date.now()}`,
        slug: `admin-ops-product-${Date.now()}`,
        sku: `AO-SKU-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 50 as any,
        trackQuantity: false,
      },
    });

    const orderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ customerId, items: [{ productId: product.id, quantity: 2 }], currency: 'USD' })
      .expect(201);

    orderId = orderRes.body?.data?.id;
    expect(orderId).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // ==================== ORDER NOTES ====================

  it('creates an order note', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/notes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Customer called about this order', isPinned: false })
      .expect(201);

    orderNoteId = res.body?.data?.id;
    expect(orderNoteId).toBeTruthy();
    expect(res.body?.data?.content).toBe('Customer called about this order');
    expect(res.body?.data?.isPinned).toBe(false);
    expect(res.body?.data?.author).toBeTruthy();
  });

  it('lists order notes (pinned first)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/notes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data.length).toBeGreaterThanOrEqual(1);
  });

  it('pins an order note', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/notes/${orderNoteId}/pin`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.isPinned).toBe(true);
  });

  it('updates an order note', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/notes/${orderNoteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Updated note content' })
      .expect(200);

    expect(res.body?.data?.content).toBe('Updated note content');
    expect(res.body?.data?.isPinned).toBe(true);
  });

  it('unpins an order note', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/notes/${orderNoteId}/unpin`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.isPinned).toBe(false);
  });

  it('deletes an order note', async () => {
    // Create a throwaway note
    const tempNote = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/notes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Temporary note to delete' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/orders/${orderId}/notes/${tempNote.body?.data?.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('returns 404 for note not belonging to order', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/notes/non-existent-id`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Should fail' })
      .expect(404);
  });

  // ==================== CUSTOMER NOTES ====================

  it('creates a customer note', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/customers/${customerId}/notes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'VIP customer, handle with care', isPinned: true })
      .expect(201);

    customerNoteId = res.body?.data?.id;
    expect(customerNoteId).toBeTruthy();
    expect(res.body?.data?.isPinned).toBe(true);
  });

  it('lists customer notes', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/customers/${customerId}/notes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data.length).toBeGreaterThanOrEqual(1);
  });

  it('updates a customer note', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/customers/${customerId}/notes/${customerNoteId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Updated customer note', isPinned: false })
      .expect(200);

    expect(res.body?.data?.content).toBe('Updated customer note');
    expect(res.body?.data?.isPinned).toBe(false);
  });

  it('pins and unpins a customer note', async () => {
    let res = await request(app.getHttpServer())
      .post(`/api/v1/customers/${customerId}/notes/${customerNoteId}/pin`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body?.data?.isPinned).toBe(true);

    res = await request(app.getHttpServer())
      .post(`/api/v1/customers/${customerId}/notes/${customerNoteId}/unpin`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body?.data?.isPinned).toBe(false);
  });

  it('deletes a customer note', async () => {
    const tempNote = await request(app.getHttpServer())
      .post(`/api/v1/customers/${customerId}/notes`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Temp customer note' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/customers/${customerId}/notes/${tempNote.body?.data?.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  // ==================== ORDER TAGS ====================

  it('creates an order tag', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/order-tags')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ key: `vip-${Date.now()}`, name: 'VIP', color: '#FFD700' })
      .expect(201);

    tagId = res.body?.data?.id;
    expect(tagId).toBeTruthy();
    expect(res.body?.data?.name).toBe('VIP');
    expect(res.body?.data?.color).toBe('#FFD700');
  });

  it('rejects duplicate tag key', async () => {
    const tag = await prisma.orderTag.findUnique({ where: { id: tagId } });
    await request(app.getHttpServer())
      .post('/api/v1/order-tags')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ key: tag!.key, name: 'Duplicate' })
      .expect(409);
  });

  it('lists all tags', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/order-tags')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data.length).toBeGreaterThanOrEqual(1);
  });

  it('updates a tag', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/order-tags/${tagId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'VIP Customer', color: '#FFA500' })
      .expect(200);

    expect(res.body?.data?.name).toBe('VIP Customer');
    expect(res.body?.data?.color).toBe('#FFA500');
  });

  it('assigns a tag to an order', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/tags/${tagId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body?.data?.id).toBe(tagId);
  });

  it('rejects duplicate tag assignment', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/tags/${tagId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(409);
  });

  it('lists order tags', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/tags`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data.some((t: any) => t.id === tagId)).toBe(true);
  });

  it('removes a tag from an order', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/orders/${orderId}/tags/${tagId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const tags = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/tags`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(tags.body?.data.some((t: any) => t.id === tagId)).toBe(false);
  });

  it('deletes an order tag', async () => {
    const tempTag = await request(app.getHttpServer())
      .post('/api/v1/order-tags')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ key: `temp-tag-${Date.now()}`, name: 'Temp Tag' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/order-tags/${tempTag.body?.data?.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  // ==================== ASSIGN + PRIORITY ====================

  it('assigns an order to a user', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/assign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: adminUserId })
      .expect(200);

    expect(res.body?.data?.assignedToUserId).toBe(adminUserId);
    expect(res.body?.data?.assignedAt).toBeTruthy();
    expect(res.body?.data?.assignedTo?.id).toBe(adminUserId);
  });

  it('filters orders by assignee', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders?assignedToUserId=${adminUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.total).toBeGreaterThanOrEqual(1);
    res.body?.data?.items?.forEach((o: any) =>
      expect(o.assignedToUserId).toBe(adminUserId),
    );
  });

  it('rejects assignment to non-existent user', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/assign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: 'non-existent-user-id' })
      .expect(404);
  });

  it('unassigns an order', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/unassign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.assignedToUserId).toBeNull();
  });

  it('rejects unassign when order is not assigned', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/unassign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('sets order priority to HIGH', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/priority`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ priority: 'HIGH' })
      .expect(200);

    expect(res.body?.data?.priority).toBe('HIGH');
  });

  it('sets order priority to URGENT', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/priority`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ priority: 'URGENT' })
      .expect(200);

    expect(res.body?.data?.priority).toBe('URGENT');
  });

  it('filters orders by priority', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/orders?priority=URGENT')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.total).toBeGreaterThanOrEqual(1);
    res.body?.data?.items?.forEach((o: any) => expect(o.priority).toBe('URGENT'));
  });

  it('filters orders by tag', async () => {
    // Re-assign the tag so we can filter by it
    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/tags/${tagId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders?tagId=${tagId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.total).toBeGreaterThanOrEqual(1);
    res.body?.data?.items?.forEach((o: any) =>
      expect(o.tagAssignments.some((a: any) => a.tag.id === tagId)).toBe(true),
    );
  });

  // ==================== TIMELINE ====================

  it('gets order timeline (desc)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/timeline`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data.length).toBeGreaterThanOrEqual(1);

    const first = res.body?.data[0];
    expect(first).toHaveProperty('type');
    expect(first).toHaveProperty('label');
    expect(first).toHaveProperty('timestamp');

    // Should be sorted newest-first (desc)
    const timestamps = res.body?.data.map((e: any) => new Date(e.timestamp).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1]).toBeGreaterThanOrEqual(timestamps[i]);
    }
  });

  it('gets order timeline (asc)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/timeline?sort=asc`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const timestamps = res.body?.data.map((e: any) => new Date(e.timestamp).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1]).toBeLessThanOrEqual(timestamps[i]);
    }
  });

  it('timeline includes order.created event', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/timeline?sort=asc`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const hasCreated = res.body?.data.some((e: any) => e.type === 'order.created');
    expect(hasCreated).toBe(true);
  });

  it('timeline includes note events', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/timeline`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const hasNote = res.body?.data.some(
      (e: any) => e.type === 'order.note.created' || e.type === 'order.note.updated',
    );
    expect(hasNote).toBe(true);
  });

  it('timeline includes tag assignment events', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}/timeline`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const hasTag = res.body?.data.some((e: any) => e.type === 'order.tag.assigned');
    expect(hasTag).toBe(true);
  });

  it('returns 404 for timeline of unknown order', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/orders/non-existent-order/timeline')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
