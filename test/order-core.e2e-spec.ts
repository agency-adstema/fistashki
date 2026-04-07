import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('Order Core (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  let accessToken: string;
  let customerId: string;
  let productId: string;
  let orderId: string;

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

    // Minimal auth+permissions bootstrap for e2e
    const permissions = [
      'customers.read',
      'customers.create',
      'customers.update',
      'orders.read',
      'orders.create',
      'orders.cancel',
      'orders.update',
      'orders.manage_payment',
      'orders.manage_fulfillment',
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
      where: { key: 'e2e_admin' },
      update: {},
      create: { key: 'e2e_admin', name: 'E2E Admin' },
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
      where: { email: 'e2e-admin@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'e2e-admin@example.com',
        passwordHash,
        firstName: 'E2E',
        lastName: 'Admin',
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
      .send({ email: 'e2e-admin@example.com', password: 'Test123!' })
      .expect(200);

    accessToken = loginRes.body?.data?.accessToken;
    expect(accessToken).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('creates a customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: `cust-${Date.now()}@example.com`,
        firstName: 'John',
        lastName: 'Doe',
        phone: '123',
        notes: 'note',
        isActive: true,
      })
      .expect(201);

    customerId = res.body?.data?.id;
    expect(customerId).toBeTruthy();
  });

  it('creates an order and deducts stock', async () => {
    // create a tracked product via prisma (avoids dependency on products module e2e)
    const p = await prisma.product.create({
      data: {
        name: `Test Product ${Date.now()}`,
        slug: `test-product-${Date.now()}`,
        sku: `SKU-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 10 as any,
        currency: 'USD',
        trackQuantity: true,
        stockQuantity: 5,
      },
    });
    productId = p.id;

    const res = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        items: [{ productId, quantity: 2 }],
        shippingTotal: 1,
        discountTotal: 0,
        currency: 'USD',
      })
      .expect(201);

    orderId = res.body?.data?.id;
    expect(orderId).toBeTruthy();
    expect(res.body?.data?.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    expect(res.body?.data?.subtotal).toBe(20);
    expect(res.body?.data?.grandTotal).toBe(21);

    const updatedProduct = await prisma.product.findUnique({ where: { id: productId } });
    expect(updatedProduct?.stockQuantity).toBe(3);
  });

  it('rejects insufficient stock', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        items: [{ productId, quantity: 999 }],
        shippingTotal: 0,
        discountTotal: 0,
        currency: 'USD',
      })
      .expect(400);
  });

  it('cancels an order and restores stock', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ cancelReason: 'test' })
      .expect(201);

    const updatedProduct = await prisma.product.findUnique({ where: { id: productId } });
    expect(updatedProduct?.stockQuantity).toBe(5);
  });
});

