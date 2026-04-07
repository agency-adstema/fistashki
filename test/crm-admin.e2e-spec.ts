import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('CRM Admin (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let accessToken: string;

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
      'dashboard.read',
      'audit_logs.read',
      'customers.read',
      'orders.read',
      'products.read',
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
      where: { key: 'e2e_crm_admin' },
      update: {},
      create: { key: 'e2e_crm_admin', name: 'E2E CRM Admin' },
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
      where: { email: 'e2e-crm@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'e2e-crm@example.com',
        passwordHash,
        firstName: 'E2E',
        lastName: 'CRM',
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
      .send({ email: 'e2e-crm@example.com', password: 'Test123!' })
      .expect(200);

    accessToken = loginRes.body?.data?.accessToken;
    expect(accessToken).toBeTruthy();

    // Seed a tracked product that is low on stock
    await prisma.product.upsert({
      where: { slug: 'e2e-low-stock-product' },
      update: { stockQuantity: 1, lowStockThreshold: 5, trackQuantity: true, isActive: true },
      create: {
        name: 'E2E Low Stock Product',
        slug: 'e2e-low-stock-product',
        sku: `SKU-LOWSTOCK-E2E`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 9.99 as any,
        trackQuantity: true,
        stockQuantity: 1,
        lowStockThreshold: 5,
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /dashboard/summary', () => {
    it('returns summary with all expected fields', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const d = res.body?.data;
      expect(typeof d.totalOrders).toBe('number');
      expect(typeof d.totalCustomers).toBe('number');
      expect(typeof d.totalProducts).toBe('number');
      expect(typeof d.totalRevenue).toBe('number');
      expect(typeof d.totalPendingOrders).toBe('number');
      expect(typeof d.totalCancelledOrders).toBe('number');
      expect(typeof d.totalLowStockProducts).toBe('number');
      expect(typeof d.revenueToday).toBe('number');
      expect(typeof d.ordersToday).toBe('number');
      expect(typeof d.customersToday).toBe('number');
    });
  });

  describe('GET /dashboard/low-stock', () => {
    it('returns only tracked products at or below threshold', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/low-stock')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const items: any[] = res.body?.data;
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      items.forEach((p) => {
        expect(p.stockQuantity).toBeLessThanOrEqual(p.lowStockThreshold);
      });
    });
  });

  describe('GET /dashboard/recent-activity', () => {
    it('returns an array of audit log entries', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/recent-activity')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body?.data)).toBe(true);
    });
  });

  describe('GET /orders with filters', () => {
    it('filters by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders?status=PENDING')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const items: any[] = res.body?.data?.items ?? [];
      items.forEach((o) => expect(o.status).toBe('PENDING'));
    });

    it('filters by date range', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders?dateFrom=2020-01-01&dateTo=2099-12-31')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(typeof res.body?.data?.total).toBe('number');
    });

    it('searches by order number', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders?search=ORD-')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(typeof res.body?.data?.total).toBe('number');
    });
  });

  describe('GET /customers with filters', () => {
    it('filters by isActive', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/customers?isActive=true')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const items: any[] = res.body?.data?.items ?? [];
      items.forEach((c) => expect(c.isActive).toBe(true));
    });

    it('searches by email', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/customers?search=example.com')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(typeof res.body?.data?.total).toBe('number');
    });
  });

  describe('GET /products with filters', () => {
    it('filters by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?status=ACTIVE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const items: any[] = res.body?.data?.items ?? [];
      items.forEach((p) => expect(p.status).toBe('ACTIVE'));
    });

    it('searches by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?search=Low+Stock')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body?.data?.total).toBeGreaterThanOrEqual(1);
    });

    it('returns low stock products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products?lowStock=true')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body?.data?.total).toBeGreaterThanOrEqual(1);
    });
  });
});
