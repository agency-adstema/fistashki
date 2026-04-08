import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import {
  PrismaClient,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentRecordStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';

describe('Returns (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  let accessToken: string;

  // IDs set up in beforeAll
  let customerId: string;
  let orderId: string;
  let orderItemId: string;

  // IDs for separate rejection test flow
  let rejectOrderId: string;
  let rejectOrderItemId: string;

  // IDs for over-quantity test
  let overQtyOrderId: string;
  let overQtyOrderItemId: string;

  // Return request IDs used through the main test flow
  let returnRequestId: string;
  let rejectReturnId: string;
  let cancelReturnId: string;

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
      'returns.read',
      'returns.create',
      'returns.approve',
      'returns.reject',
      'returns.receive',
      'returns.refund',
      'returns.complete',
      'returns.cancel',
      'payments.read',
      'payments.create',
      'payments.mark_paid',
      'payments.refund',
      'orders.create',
      'orders.read',
      'customers.create',
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
      where: { key: 'e2e_returns' },
      update: {},
      create: { key: 'e2e_returns', name: 'E2E Returns' },
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
      where: { email: 'e2e-returns@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'e2e-returns@example.com',
        passwordHash,
        firstName: 'E2E',
        lastName: 'Returns',
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
      .send({ email: 'e2e-returns@example.com', password: 'Test123!' })
      .expect(200);

    accessToken = loginRes.body?.data?.accessToken;

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: `returns-cust-${Date.now()}@example.com`,
        firstName: 'Returns',
        lastName: 'Tester',
        isActive: true,
      },
    });
    customerId = customer.id;

    // Create a trackable product with enough stock
    const product = await prisma.product.create({
      data: {
        name: `Return Product ${Date.now()}`,
        slug: `return-product-${Date.now()}`,
        sku: `RET-SKU-${Date.now()}`,
        status: ProductStatus.ACTIVE,
        isActive: true,
        price: 100 as any,
        trackQuantity: true,
        stockQuantity: 50,
      },
    });

    // Create order directly via API
    const orderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        items: [{ productId: product.id, quantity: 5 }],
        currency: 'USD',
      })
      .expect(201);

    orderId = orderRes.body?.data?.id;
    expect(orderId).toBeTruthy();

    // Deliver the order via Prisma directly
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DELIVERED },
    });

    // Fetch order items
    const orderWithItems = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    orderItemId = orderWithItems!.items[0].id;

    // Create a PAID payment for the order
    const payment = await prisma.payment.create({
      data: {
        orderId,
        method: PaymentMethod.CARD,
        provider: PaymentProvider.STRIPE,
        amount: 500 as any, // 5 * 100
        currency: 'USD',
        status: PaymentRecordStatus.PAID,
        paidAt: new Date(),
      },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' },
    });
    expect(payment.id).toBeTruthy();

    // ---- Separate order for reject test ----
    const rejectOrderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        items: [{ productId: product.id, quantity: 2 }],
        currency: 'USD',
      })
      .expect(201);

    rejectOrderId = rejectOrderRes.body?.data?.id;
    await prisma.order.update({
      where: { id: rejectOrderId },
      data: { status: OrderStatus.DELIVERED },
    });
    const rejectOrderWithItems = await prisma.order.findUnique({
      where: { id: rejectOrderId },
      include: { items: true },
    });
    rejectOrderItemId = rejectOrderWithItems!.items[0].id;

    // ---- Separate order for over-quantity test ----
    const overQtyOrderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        items: [{ productId: product.id, quantity: 2 }],
        currency: 'USD',
      })
      .expect(201);

    overQtyOrderId = overQtyOrderRes.body?.data?.id;
    await prisma.order.update({
      where: { id: overQtyOrderId },
      data: { status: OrderStatus.DELIVERED },
    });
    const overQtyOrderWithItems = await prisma.order.findUnique({
      where: { id: overQtyOrderId },
      include: { items: true },
    });
    overQtyOrderItemId = overQtyOrderWithItems!.items[0].id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  // ==================== CREATE ====================

  it('creates a return request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId,
        customerId,
        reason: 'Item defective',
        notes: 'Screen cracked on arrival',
        items: [{ orderItemId, quantity: 2, reason: 'Defective' }],
      })
      .expect(201);

    returnRequestId = res.body?.data?.id;
    expect(returnRequestId).toBeTruthy();
    expect(res.body?.data?.status).toBe('REQUESTED');
    expect(res.body?.data?.items).toHaveLength(1);
    expect(res.body?.data?.items[0].quantity).toBe(2);
    expect(res.body?.data?.items[0].unitPriceSnapshot).toBe(100);
    expect(res.body?.data?.items[0].totalAmount).toBe(200);
  });

  it('rejects return for PENDING order', async () => {
    // Create a fresh order (it starts PENDING)
    const product = await prisma.product.findFirst({ where: { sku: { startsWith: 'RET-SKU-' } } });
    const pendingOrderRes = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        items: [{ productId: product!.id, quantity: 1 }],
        currency: 'USD',
      })
      .expect(201);

    const pendingOrderId = pendingOrderRes.body?.data?.id;
    const pendingOrderItems = await prisma.order.findUnique({
      where: { id: pendingOrderId },
      include: { items: true },
    });

    await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId: pendingOrderId,
        reason: 'Buyer remorse',
        items: [{ orderItemId: pendingOrderItems!.items[0].id, quantity: 1 }],
      })
      .expect(400);
  });

  it('rejects over-quantity return', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId: overQtyOrderId,
        reason: 'Testing over qty',
        items: [{ orderItemId: overQtyOrderItemId, quantity: 99 }],
      })
      .expect(400);
  });

  it('rejects return with items not belonging to the order', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId,
        reason: 'Wrong item id',
        items: [{ orderItemId: 'non-existent-id', quantity: 1 }],
      })
      .expect(400);
  });

  // ==================== LIST / GET ====================

  it('lists return requests', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body?.data?.items)).toBe(true);
  });

  it('filters returns by orderId', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/returns?orderId=${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    res.body?.data?.items?.forEach((r: any) => expect(r.order.id).toBe(orderId));
  });

  it('gets return by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/returns/${returnRequestId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.id).toBe(returnRequestId);
    expect(res.body?.data?.status).toBe('REQUESTED');
  });

  // ==================== APPROVE ====================

  it('approves the return request', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.status).toBe('APPROVED');
    expect(res.body?.data?.approvedAt).toBeTruthy();
  });

  it('cannot approve an already-approved return', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  // ==================== REJECT ====================

  it('creates a second return request for reject testing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId: rejectOrderId,
        reason: 'Wrong size',
        items: [{ orderItemId: rejectOrderItemId, quantity: 1 }],
      })
      .expect(201);

    rejectReturnId = res.body?.data?.id;
    expect(rejectReturnId).toBeTruthy();
  });

  it('rejects the second return request', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/returns/${rejectReturnId}/reject`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ notes: 'Item not eligible for return' })
      .expect(200);

    expect(res.body?.data?.status).toBe('REJECTED');
    expect(res.body?.data?.rejectedAt).toBeTruthy();
  });

  it('cannot approve a rejected return', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/returns/${rejectReturnId}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  // ==================== MARK RECEIVED (stock reintegration) ====================

  it('marks return as received and restocks items', async () => {
    // Record stock before
    const productBefore = await prisma.product.findFirst({
      where: { sku: { startsWith: 'RET-SKU-' } },
    });
    const stockBefore = productBefore!.stockQuantity;

    const res = await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/mark-received`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.status).toBe('RECEIVED');
    expect(res.body?.data?.receivedAt).toBeTruthy();

    // Verify stock was restocked (returned 2 units)
    const productAfter = await prisma.product.findFirst({
      where: { sku: { startsWith: 'RET-SKU-' } },
    });
    expect(productAfter!.stockQuantity).toBe(stockBefore + 2);
  });

  it('cannot mark received twice', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/mark-received`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  // ==================== MARK REFUND PENDING ====================

  it('marks return as refund pending', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/mark-refund-pending`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.status).toBe('REFUND_PENDING');
  });

  // ==================== REFUND ====================

  it('processes the refund for the return', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/refund`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.status).toBe('REFUNDED');

    // Verify payment was partially refunded (200 of 500)
    const payments = await prisma.payment.findMany({
      where: { orderId },
    });
    const totalRefunded = payments.reduce(
      (sum: number, p: any) => sum + Number(p.refundedAmount),
      0,
    );
    expect(totalRefunded).toBe(200);
  });

  it('cannot refund again after already refunded', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/refund`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  // ==================== COMPLETE ====================

  it('completes the return', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.status).toBe('COMPLETED');
    expect(res.body?.data?.completedAt).toBeTruthy();
  });

  it('cannot complete an already-completed return', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  // ==================== CANCEL ====================

  it('creates a return request for cancel testing', async () => {
    // Create fresh return on overQtyOrder (qty 1 of 2 ordered)
    const res = await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId: overQtyOrderId,
        reason: 'Changed mind',
        items: [{ orderItemId: overQtyOrderItemId, quantity: 1 }],
      })
      .expect(201);

    cancelReturnId = res.body?.data?.id;
    expect(cancelReturnId).toBeTruthy();
  });

  it('cancels a return request', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/returns/${cancelReturnId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body?.data?.status).toBe('CANCELLED');
  });

  it('cannot cancel a completed return', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/returns/${returnRequestId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  // ==================== QUANTITY ACCUMULATION ====================

  it('allows a second return on same order within remaining quantity', async () => {
    // returnRequestId already returned 2 items; 3 remain
    const res = await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId,
        reason: 'Additional return',
        items: [{ orderItemId, quantity: 3 }],
      })
      .expect(201);

    expect(res.body?.data?.items[0].quantity).toBe(3);
  });

  it('rejects second return that would exceed total ordered quantity', async () => {
    // After 2 + 3 = 5 returned, another 1 would exceed the 5 ordered
    await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId,
        reason: 'Over-return attempt',
        items: [{ orderItemId, quantity: 1 }],
      })
      .expect(400);
  });

  // ==================== INVALID STATUS TRANSITION ====================

  it('rejects invalid status transition (REQUESTED → RECEIVED)', async () => {
    // Create a fresh return request for this test
    const product = await prisma.product.findFirst({ where: { sku: { startsWith: 'RET-SKU-' } } });
    const freshOrder = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId,
        items: [{ productId: product!.id, quantity: 1 }],
        currency: 'USD',
      })
      .expect(201);

    await prisma.order.update({
      where: { id: freshOrder.body?.data?.id },
      data: { status: OrderStatus.DELIVERED },
    });

    const freshOrderItems = await prisma.order.findUnique({
      where: { id: freshOrder.body?.data?.id },
      include: { items: true },
    });

    const freshReturn = await request(app.getHttpServer())
      .post('/api/v1/returns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        orderId: freshOrder.body?.data?.id,
        reason: 'Test invalid transition',
        items: [{ orderItemId: freshOrderItems!.items[0].id, quantity: 1 }],
      })
      .expect(201);

    // Attempt to mark received without approving first
    await request(app.getHttpServer())
      .post(`/api/v1/returns/${freshReturn.body?.data?.id}/mark-received`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });
});
