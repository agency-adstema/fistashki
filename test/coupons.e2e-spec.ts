import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient, ProductStatus, CouponType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('Coupons (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let accessToken: string;

  let couponId: string;
  let expiredCouponId: string;
  let limitedCouponId: string;
  let inactiveCouponId: string;
  let productId: string;
  let customerId: string;
  let cartId: string;

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

    // Auth setup for coupon CRUD
    const permissions = ['coupons.read', 'coupons.create', 'coupons.update', 'coupons.delete'];
    const seededPerms = await Promise.all(
      permissions.map((key) =>
        prisma.permission.upsert({
          where: { key },
          update: {},
          create: { key, name: key, description: key },
        }),
      ),
    );
    const role = await prisma.role.upsert({
      where: { key: 'e2e_coupons' },
      update: {},
      create: { key: 'e2e_coupons', name: 'E2E Coupons' },
    });
    await Promise.all(
      seededPerms.map((p) =>
        prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
          update: {},
          create: { roleId: role.id, permissionId: p.id },
        }),
      ),
    );
    const passwordHash = await bcrypt.hash('Test123!', 12);
    const user = await prisma.user.upsert({
      where: { email: 'e2e-coupons@example.com' },
      update: { passwordHash, isActive: true },
      create: { email: 'e2e-coupons@example.com', passwordHash, firstName: 'Coupon', lastName: 'Admin', isActive: true },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'e2e-coupons@example.com', password: 'Test123!' })
      .expect(200);
    accessToken = loginRes.body?.data?.accessToken;

    // Product + customer fixtures
    const product = await prisma.product.create({
      data: {
        name: `Coupon Prod ${Date.now()}`,
        slug: `coupon-prod-${Date.now()}`,
        sku: `CPN-SKU-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 100 as any,
        trackQuantity: false,
      },
    });
    productId = product.id;

    const customer = await prisma.customer.create({
      data: {
        email: `coupon-cust-${Date.now()}@example.com`,
        firstName: 'Coupon',
        lastName: 'Customer',
        isActive: true,
      },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // ── Coupon CRUD ────────────────────────────────────────────────────────────

  it('creates a coupon (20% off, max $15)', async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const res = await request(app.getHttpServer())
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        code: `SAVE20_${Date.now()}`,
        type: CouponType.PERCENTAGE,
        value: 20,
        maxDiscountAmount: 15,
        minOrderAmount: 50,
        validFrom: new Date().toISOString(),
        validTo: future,
      })
      .expect(201);

    couponId = res.body?.data?.id;
    expect(couponId).toBeTruthy();
    expect(res.body?.data?.value).toBe(20);
    expect(res.body?.data?.isActive).toBe(true);
  });

  it('creates an expired coupon', async () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    const past2 = new Date(Date.now() - 1000 * 60).toISOString();
    const res = await request(app.getHttpServer())
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        code: `EXPIRED_${Date.now()}`,
        type: CouponType.FIXED,
        value: 10,
        validFrom: past,
        validTo: past2,
      })
      .expect(201);
    expiredCouponId = res.body?.data?.id;
  });

  it('creates a coupon with usageLimit = 1', async () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app.getHttpServer())
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        code: `LIMITED1_${Date.now()}`,
        type: CouponType.FIXED,
        value: 5,
        usageLimit: 1,
        validFrom: new Date().toISOString(),
        validTo: future,
      })
      .expect(201);
    limitedCouponId = res.body?.data?.id;
    // Burn the one usage
    await prisma.coupon.update({ where: { id: limitedCouponId }, data: { usedCount: 1 } });
  });

  it('creates an inactive coupon', async () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app.getHttpServer())
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        code: `INACTIVE_${Date.now()}`,
        type: CouponType.FIXED,
        value: 10,
        isActive: false,
        validFrom: new Date().toISOString(),
        validTo: future,
      })
      .expect(201);
    inactiveCouponId = res.body?.data?.id;
  });

  it('updates a coupon', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/coupons/${couponId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maxDiscountAmount: 20 })
      .expect(200);
    expect(res.body?.data?.maxDiscountAmount).toBe(20);
  });

  it('lists coupons', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/coupons')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body?.data?.total).toBeGreaterThan(0);
  });

  // ── Cart + coupon integration ──────────────────────────────────────────────

  it('sets up cart with items', async () => {
    const cartRes = await request(app.getHttpServer())
      .post('/api/v1/carts')
      .send({ currency: 'USD' })
      .expect(201);
    cartId = cartRes.body?.data?.id;

    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/items`)
      .send({ productId, quantity: 1 })
      .expect(201);
  });

  it('applies a valid coupon and recalculates totals', async () => {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    const res = await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/apply-coupon`)
      .send({ code: coupon!.code })
      .expect(201);

    // 20% of 100 = 20, capped at 20 (we updated maxDiscount to 20)
    expect(res.body?.data?.discountTotal).toBe(20);
    expect(res.body?.data?.grandTotal).toBe(80);
    expect(res.body?.data?.couponId).toBe(couponId);
  });

  it('removes the coupon and resets discount', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/remove-coupon`)
      .expect(201);

    expect(res.body?.data?.discountTotal).toBe(0);
    expect(res.body?.data?.grandTotal).toBe(100);
    expect(res.body?.data?.couponId).toBeNull();
  });

  it('rejects an inactive coupon', async () => {
    const coupon = await prisma.coupon.findUnique({ where: { id: inactiveCouponId } });
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/apply-coupon`)
      .send({ code: coupon!.code })
      .expect(400);
  });

  it('rejects an expired coupon', async () => {
    const coupon = await prisma.coupon.findUnique({ where: { id: expiredCouponId } });
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/apply-coupon`)
      .send({ code: coupon!.code })
      .expect(400);
  });

  it('rejects a coupon with usage limit reached', async () => {
    const coupon = await prisma.coupon.findUnique({ where: { id: limitedCouponId } });
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/apply-coupon`)
      .send({ code: coupon!.code })
      .expect(400);
  });

  it('rejects a non-existent coupon code', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/apply-coupon`)
      .send({ code: 'DOESNOTEXIST999' })
      .expect(404);
  });

  it('rejects coupon when subtotal < minOrderAmount', async () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const minCoupon = await prisma.coupon.create({
      data: {
        code: `MINAMT_${Date.now()}`,
        type: CouponType.FIXED,
        value: 5,
        minOrderAmount: 500 as any, // cart has 100 subtotal
        isActive: true,
        validFrom: new Date(),
        validTo: new Date(future),
      },
    });

    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/apply-coupon`)
      .send({ code: minCoupon.code })
      .expect(400);
  });

  it('checkout with coupon records CouponUsage and increments usedCount', async () => {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    const beforeCount = coupon!.usedCount;

    // Re-apply coupon
    await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/apply-coupon`)
      .send({ code: coupon!.code })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/carts/${cartId}/checkout`)
      .send({ customerId })
      .expect(201);

    expect(res.body?.data?.order?.id).toBeTruthy();
    expect(res.body?.data?.order?.discountTotal).toBe(20);

    const updatedCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    expect(updatedCoupon!.usedCount).toBe(beforeCount + 1);

    const usage = await prisma.couponUsage.findFirst({
      where: { couponId, orderId: res.body?.data?.order?.id },
    });
    expect(usage).not.toBeNull();
  });

  it('deletes a coupon', async () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const toDelete = await request(app.getHttpServer())
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        code: `DELETE_ME_${Date.now()}`,
        type: CouponType.FIXED,
        value: 1,
        validFrom: new Date().toISOString(),
        validTo: future,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/coupons/${toDelete.body?.data?.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
