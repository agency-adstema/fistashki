import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient, ProductStatus, PaymentMethod, PaymentProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('Payments (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let accessToken: string;

  let customerId: string;
  let orderId: string;
  let paymentIdForPaid: string;
  let paymentIdForFailed: string;
  let paymentIdForPartialRefund: string;
  let paymentIdForFullRefund: string;

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
      'payments.read', 'payments.create', 'payments.mark_paid',
      'payments.mark_failed', 'payments.refund',
      'customers.create', 'orders.create', 'orders.read',
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
      where: { key: 'e2e_payments' },
      update: {},
      create: { key: 'e2e_payments', name: 'E2E Payments' },
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
      where: { email: 'e2e-payments@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'e2e-payments@example.com',
        passwordHash,
        firstName: 'E2E',
        lastName: 'Payments',
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
      .send({ email: 'e2e-payments@example.com', password: 'Test123!' })
      .expect(200);

    accessToken = loginRes.body?.data?.accessToken;

    // Setup: customer + product + order
    const customer = await prisma.customer.create({
      data: {
        email: `pay-cust-${Date.now()}@example.com`,
        firstName: 'Pay',
        lastName: 'Test',
        isActive: true,
      },
    });
    customerId = customer.id;

    const product = await prisma.product.create({
      data: {
        name: `Pay Product ${Date.now()}`,
        slug: `pay-product-${Date.now()}`,
        sku: `PAY-SKU-${Date.now()}`,
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

  it('creates a payment record', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId, method: PaymentMethod.CARD, provider: PaymentProvider.STRIPE })
      .expect(201);

    paymentIdForPaid = res.body?.data?.id;
    expect(paymentIdForPaid).toBeTruthy();
    expect(res.body?.data?.status).toBe('PENDING');
    expect(res.body?.data?.amount).toBe(100); // 2 * 50
  });

  it('creates a second payment for failed test', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId, method: PaymentMethod.CARD, provider: PaymentProvider.STRIPE })
      .expect(201);
    paymentIdForFailed = res.body?.data?.id;
    expect(paymentIdForFailed).toBeTruthy();
  });

  it('creates payments for refund tests', async () => {
    const r1 = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId, method: PaymentMethod.CARD, provider: PaymentProvider.STRIPE })
      .expect(201);
    paymentIdForPartialRefund = r1.body?.data?.id;

    const r2 = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId, method: PaymentMethod.CARD, provider: PaymentProvider.STRIPE })
      .expect(201);
    paymentIdForFullRefund = r2.body?.data?.id;
  });

  it('marks a payment as paid', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForPaid}/mark-paid`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ providerTransactionId: 'txn_test_001' })
      .expect(201);

    expect(res.body?.data?.status).toBe('PAID');
    expect(res.body?.data?.paidAt).toBeTruthy();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.paymentStatus).toBe('PAID');
  });

  it('marks a payment as failed', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForFailed}/mark-failed`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ failureReason: 'Card declined' })
      .expect(201);

    expect(res.body?.data?.status).toBe('FAILED');
    expect(res.body?.data?.failureReason).toBe('Card declined');
  });

  it('cannot mark an already-paid payment as paid again', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForPaid}/mark-paid`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it('does a partial refund', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForPartialRefund}/mark-paid`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForPartialRefund}/refund`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 30 })
      .expect(201);

    expect(res.body?.data?.status).toBe('PARTIALLY_REFUNDED');
    expect(res.body?.data?.refundedAmount).toBe(30);
  });

  it('does a full refund', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForFullRefund}/mark-paid`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForFullRefund}/refund`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})  // no amount = full refund
      .expect(201);

    expect(res.body?.data?.status).toBe('REFUNDED');
    expect(res.body?.data?.refundedAmount).toBe(res.body?.data?.amount);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.paymentStatus).toBe('REFUNDED');
  });

  it('rejects refund exceeding paid amount', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentIdForPartialRefund}/refund`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 999 })
      .expect(400);
  });

  it('cannot refund an unpaid payment', async () => {
    const newPay = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ orderId, method: PaymentMethod.MANUAL, provider: PaymentProvider.MANUAL })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/payments/${newPay.body?.data?.id}/refund`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it('lists payments with filter by orderId', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/payments?orderId=${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.total).toBeGreaterThanOrEqual(4);
    res.body?.data?.items?.forEach((p: any) => expect(p.orderId).toBe(orderId));
  });
});
