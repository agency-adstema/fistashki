import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient, ProductStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('Cart + Checkout (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  // Auth token is only needed for admin carts.read test
  let accessToken: string;

  // Product fixtures
  let productId: string;
  let trackedProductId: string;
  let inactiveProductId: string;
  let shippingMethodId: string;
  let customerId: string;

  // Cart state across tests
  let cartId: string;
  let cartItemId: string;

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

    // Admin user for carts.read
    const cartReadPerm = await prisma.permission.upsert({
      where: { key: 'carts.read' },
      update: {},
      create: { key: 'carts.read', name: 'carts.read', description: 'carts.read' },
    });
    const adminRole = await prisma.role.upsert({
      where: { key: 'e2e_carts_admin' },
      update: {},
      create: { key: 'e2e_carts_admin', name: 'E2E Carts Admin' },
    });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: cartReadPerm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: cartReadPerm.id },
    });
    const passwordHash = await bcrypt.hash('Test123!', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'e2e-carts@example.com' },
      update: { passwordHash, isActive: true },
      create: { email: 'e2e-carts@example.com', passwordHash, firstName: 'Cart', lastName: 'Admin', isActive: true },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'e2e-carts@example.com', password: 'Test123!' })
      .expect(200);
    accessToken = loginRes.body?.data?.accessToken;

    // Products
    const prod = await prisma.product.create({
      data: {
        name: `Cart Prod ${Date.now()}`,
        slug: `cart-prod-${Date.now()}`,
        sku: `CART-SKU-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 25 as any,
        trackQuantity: false,
      },
    });
    productId = prod.id;

    const trackedProd = await prisma.product.create({
      data: {
        name: `Cart Tracked ${Date.now()}`,
        slug: `cart-tracked-${Date.now()}`,
        sku: `CART-TRACKED-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 40 as any,
        trackQuantity: true,
        stockQuantity: 3,
      },
    });
    trackedProductId = trackedProd.id;

    const inactiveProd = await prisma.product.create({
      data: {
        name: `Cart Inactive ${Date.now()}`,
        slug: `cart-inactive-${Date.now()}`,
        sku: `CART-INACTIVE-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: false,
        price: 10 as any,
        trackQuantity: false,
      },
    });
    inactiveProductId = inactiveProd.id;

    const sm = await prisma.shippingMethod.create({
      data: {
        key: `cart_shipping_${Date.now()}`,
        name: 'Cart Test Shipping',
        price: 5 as any,
        isActive: true,
      },
    });
    shippingMethodId = sm.id;

    const cust = await prisma.customer.create({
      data: {
        email: `cart-cust-${Date.now()}@example.com`,
        firstName: 'Cart',
        lastName: 'Customer',
        isActive: true,
      },
    });
    customerId = cust.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // ── Cart lifecycle ─────────────────────────────────────────────────────────

  it('creates a cart', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({ sessionId: `sess_${Date.now()}`, currency: 'USD' })
      .expect(201);

    cartId = res.body?.data?.id;
    expect(cartId).toBeTruthy();
    expect(res.body?.data?.status).toBe('ACTIVE');
    expect(res.body?.data?.grandTotal).toBe(0);
  });

  it('adds an item to the cart', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/items`)
      .send({ productId, quantity: 2 })
      .expect(201);

    const items = res.body?.data?.items;
    expect(items).toHaveLength(1);
    cartItemId = items[0].id;
    expect(items[0].quantity).toBe(2);
    expect(res.body?.data?.subtotal).toBe(50);
    expect(res.body?.data?.grandTotal).toBe(50);
  });

  it('rejects adding an inactive product', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/items`)
      .send({ productId: inactiveProductId, quantity: 1 })
      .expect(400);
  });

  it('rejects adding more than available stock', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/items`)
      .send({ productId: trackedProductId, quantity: 10 })
      .expect(400);
  });

  it('updates item quantity', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/carts/${cartId}/items/${cartItemId}`)
      .send({ quantity: 3 })
      .expect(200);

    const item = res.body?.data?.items?.find((i: any) => i.id === cartItemId);
    expect(item?.quantity).toBe(3);
    expect(res.body?.data?.subtotal).toBe(75);
  });

  it('assigns shipping method and updates grandTotal', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/carts/${cartId}/shipping-method`)
      .send({ shippingMethodId })
      .expect(200);

    expect(res.body?.data?.shippingMethodId).toBe(shippingMethodId);
    expect(res.body?.data?.shippingTotal).toBe(5);
    expect(res.body?.data?.grandTotal).toBe(80); // 75 + 5
  });

  it('assigns payment method', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/carts/${cartId}/payment-method`)
      .send({ paymentMethod: PaymentMethod.CARD })
      .expect(200);

    expect(res.body?.data?.paymentMethod).toBe('CARD');
  });

  it('assigns customer to cart', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/carts/${cartId}/assign-customer`)
      .send({ customerId })
      .expect(200);

    expect(res.body?.data?.customerId).toBe(customerId);
  });

  it('removes a specific item', async () => {
    // Add a second item to remove
    const addRes = await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/items`)
      .send({ productId: trackedProductId, quantity: 1 })
      .expect(201);
    const secondItemId = addRes.body?.data?.items?.find(
      (i: any) => i.product.id === trackedProductId,
    )?.id;

    const res = await request(app.getHttpServer())
      .delete(`/api/v1/carts/${cartId}/items/${secondItemId}`)
      .expect(200);

    const remaining = res.body?.data?.items?.map((i: any) => i.product.id);
    expect(remaining).not.toContain(trackedProductId);
  });

  it('checks out cart into order (existing customer)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/checkout`)
      .send({ customerId })
      .expect(201);

    expect(res.body?.data?.order?.id).toBeTruthy();
    expect(res.body?.data?.order?.orderNumber).toMatch(/^ORD-/);
    expect(res.body?.data?.order?.grandTotal).toBe(80);
    expect(res.body?.data?.payment).toBeTruthy(); // CARD method → payment created
  });

  it('cannot checkout an already-checked-out cart', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/checkout`)
      .send({ customerId })
      .expect(400);
  });

  it('rejects checkout of empty cart', async () => {
    const newCartRes = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({ currency: 'USD' })
      .expect(201);
    const emptyCartId = newCartRes.body?.data?.id;

    await request(app.getHttpServer())
      .post(`/api/v1/carts/${emptyCartId}/checkout`)
      .send({ customerId })
      .expect(400);
  });

  it('rejects checkout with insufficient stock', async () => {
    const stockCartRes = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({ currency: 'USD' })
      .expect(201);
    const stockCartId = stockCartRes.body?.data?.id;

    // Add tracked product (3 in stock) — quantity within stock limit
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${stockCartId}/items`)
      .send({ productId: trackedProductId, quantity: 2 })
      .expect(201);

    // Drain stock directly via DB so checkout fails
    await prisma.product.update({
      where: { id: trackedProductId },
      data: { stockQuantity: 0 },
    });

    await request(app.getHttpServer())
      .post(`/api/v1/carts/${stockCartId}/checkout`)
      .send({ customerId })
      .expect(400);

    // Restore stock for other tests
    await prisma.product.update({
      where: { id: trackedProductId },
      data: { stockQuantity: 3 },
    });
  });

  it('guest checkout with new email creates customer', async () => {
    const guestCartRes = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({ currency: 'USD' })
      .expect(201);
    const guestCartId = guestCartRes.body?.data?.id;

    await request(app.getHttpServer())
      .post(`/api/v1/carts/${guestCartId}/items`)
      .send({ productId, quantity: 1 })
      .expect(201);

    const guestEmail = `guest-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post(`/api/v1/carts/${guestCartId}/checkout`)
      .send({
        guest: {
          email: guestEmail,
          firstName: 'Guest',
          lastName: 'User',
        },
      })
      .expect(201);

    expect(res.body?.data?.order?.id).toBeTruthy();
    const customer = await prisma.customer.findUnique({ where: { email: guestEmail } });
    expect(customer).not.toBeNull();
  });

  it('clears all cart items', async () => {
    const clearCartRes = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({})
      .expect(201);
    const clearCartId = clearCartRes.body?.data?.id;

    await request(app.getHttpServer())
      .post(`/api/v1/carts/${clearCartId}/items`)
      .send({ productId, quantity: 1 })
      .expect(201);

    const res = await request(app.getHttpServer())
      .delete(`/api/v1/carts/${clearCartId}/items`)
      .expect(200);

    expect(res.body?.data?.items).toHaveLength(0);
    expect(res.body?.data?.subtotal).toBe(0);
  });

  it('admin can list carts', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.total).toBeGreaterThan(0);
  });
});
