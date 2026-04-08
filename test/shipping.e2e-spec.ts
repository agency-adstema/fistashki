import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('Shipping (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let accessToken: string;

  let shippingMethodId: string;
  let orderId: string;
  let cancelledOrderId: string;
  let shipmentId: string;
  let cancelShipmentId: string;
  let cancelOrderForShipment: string;

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
      'shipping_methods.read', 'shipping_methods.create', 'shipping_methods.update', 'shipping_methods.delete',
      'shipments.read', 'shipments.create', 'shipments.update', 'shipments.cancel',
      'customers.create', 'orders.create', 'orders.read', 'orders.update', 'orders.cancel',
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
      where: { key: 'e2e_shipping' },
      update: {},
      create: { key: 'e2e_shipping', name: 'E2E Shipping' },
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
      where: { email: 'e2e-shipping@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'e2e-shipping@example.com',
        passwordHash,
        firstName: 'E2E',
        lastName: 'Shipping',
        isActive: true,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'e2e-shipping@example.com', password: 'Test123!' })
      .expect(200);
    accessToken = loginRes.body?.data?.accessToken;

    // Create shared product + customer
    const product = await prisma.product.create({
      data: {
        name: `Ship Product ${Date.now()}`,
        slug: `ship-product-${Date.now()}`,
        sku: `SHIP-SKU-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 80 as any,
        trackQuantity: false,
      },
    });
    const customer = await prisma.customer.create({
      data: {
        email: `ship-cust-${Date.now()}@example.com`,
        firstName: 'Ship',
        lastName: 'Test',
        isActive: true,
      },
    });

    // Active order
    const orderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ customerId: customer.id, items: [{ productId: product.id, quantity: 1 }] })
      .expect(201);
    orderId = orderRes.body?.data?.id;

    // Order for the cancel-shipment test (keeps the main order clean)
    const cancelShipOrderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ customerId: customer.id, items: [{ productId: product.id, quantity: 1 }] })
      .expect(201);
    cancelOrderForShipment = cancelShipOrderRes.body?.data?.id;

    // Cancelled order for rejection test
    const cancelledOrderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ customerId: customer.id, items: [{ productId: product.id, quantity: 1 }] })
      .expect(201);
    cancelledOrderId = cancelledOrderRes.body?.data?.id;
    await request(app.getHttpServer())
      .post(`/api/v1/orders/${cancelledOrderId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ cancelReason: 'Test cancellation' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // ── Shipping Methods ──────────────────────────────────────────────────────

  it('creates a shipping method', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/shipping-methods')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        key: `standard_post_${Date.now()}`,
        name: 'Standard Post',
        price: 5.99,
        currency: 'USD',
        estimatedMinDays: 3,
        estimatedMaxDays: 7,
      })
      .expect(201);

    shippingMethodId = res.body?.data?.id;
    expect(shippingMethodId).toBeTruthy();
    expect(res.body?.data?.price).toBe(5.99);
    expect(res.body?.data?.isActive).toBe(true);
  });

  it('updates a shipping method', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/shipping-methods/${shippingMethodId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Standard Post Updated', estimatedMaxDays: 5 })
      .expect(200);

    expect(res.body?.data?.name).toBe('Standard Post Updated');
    expect(res.body?.data?.estimatedMaxDays).toBe(5);
  });

  it('deactivates a shipping method', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/shipping-methods/${shippingMethodId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false })
      .expect(200);

    expect(res.body?.data?.isActive).toBe(false);

    // Re-activate for use in shipment tests
    await request(app.getHttpServer())
      .patch(`/api/v1/shipping-methods/${shippingMethodId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true })
      .expect(200);
  });

  it('rejects duplicate shipping method key', async () => {
    const key = `dup_key_${Date.now()}`;
    await request(app.getHttpServer())
      .post('/api/v1/shipping-methods')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ key, name: 'First', price: 1 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/shipping-methods')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ key, name: 'Second', price: 2 })
      .expect(409);
  });

  it('lists shipping methods', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/shipping-methods')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data?.length).toBeGreaterThan(0);
  });

  // ── Shipments ─────────────────────────────────────────────────────────────

  it('creates a shipment for an order', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId, shippingMethodId })
      .expect(201);

    shipmentId = res.body?.data?.id;
    expect(shipmentId).toBeTruthy();
    expect(res.body?.data?.status).toBe('PENDING');
  });

  it('creates a second shipment on isolated order (for cancel test)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId: cancelOrderForShipment })
      .expect(201);
    cancelShipmentId = res.body?.data?.id;
  });

  it('rejects shipment creation for a cancelled order', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/shipments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId: cancelledOrderId })
      .expect(400);
  });

  it('attaches tracking information', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/shipments/${shipmentId}/tracking`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ courier: 'DHL', service: 'Express', trackingNumber: 'DHL123456789' })
      .expect(200);

    expect(res.body?.data?.courier).toBe('DHL');
    expect(res.body?.data?.trackingNumber).toBe('DHL123456789');
  });

  it('moves shipment to READY_TO_SHIP', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'READY_TO_SHIP' })
      .expect(200);

    expect(res.body?.data?.status).toBe('READY_TO_SHIP');
  });

  it('marks shipment as shipped and syncs order fulfillment', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/shipments/${shipmentId}/mark-shipped`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body?.data?.status).toBe('SHIPPED');
    expect(res.body?.data?.shippedAt).toBeTruthy();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.fulfillmentStatus).toBe('PARTIALLY_FULFILLED');
  });

  it('marks shipment as delivered and syncs order fulfillment to FULFILLED', async () => {
    // Move through IN_TRANSIT first
    await request(app.getHttpServer())
      .patch(`/api/v1/shipments/${shipmentId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'IN_TRANSIT' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/shipments/${shipmentId}/mark-delivered`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body?.data?.status).toBe('DELIVERED');
    expect(res.body?.data?.deliveredAt).toBeTruthy();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.fulfillmentStatus).toBe('FULFILLED');
  });

  it('rejects invalid transition (DELIVERED → SHIPPED)', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/shipments/${shipmentId}/mark-shipped`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('cancels a shipment', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/shipments/${cancelShipmentId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body?.data?.status).toBe('CANCELLED');
  });

  it('rejects cancel of already-cancelled shipment', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/shipments/${cancelShipmentId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('lists shipments filtered by orderId', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/shipments?orderId=${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.total).toBeGreaterThanOrEqual(1);
    res.body?.data?.items?.forEach((s: any) => expect(s.orderId).toBe(orderId));
  });

  it('deletes a shipping method', async () => {
    // Create a fresh method to safely delete
    const res = await request(app.getHttpServer())
      .post('/api/v1/shipping-methods')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ key: `delete_me_${Date.now()}`, name: 'Delete Me', price: 0 })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/shipping-methods/${res.body?.data?.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
