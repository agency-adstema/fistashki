import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';

const makePrismaMock = (overrides: Partial<any> = {}) => ({
  order: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  customer: { count: jest.fn() },
  product: { count: jest.fn() },
  auditLog: { findMany: jest.fn() },
  $queryRaw: jest.fn(),
  ...overrides,
});

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new DashboardService(prisma as unknown as PrismaService);
  });

  describe('getSummary', () => {
    it('returns all summary fields with correct types', async () => {
      prisma.order.count
        .mockResolvedValueOnce(10)  // totalOrders
        .mockResolvedValueOnce(2)   // totalPendingOrders
        .mockResolvedValueOnce(1)   // totalCancelledOrders
        .mockResolvedValueOnce(3)   // ordersToday
      prisma.customer.count
        .mockResolvedValueOnce(5)   // totalCustomers
        .mockResolvedValueOnce(1);  // customersToday
      prisma.product.count.mockResolvedValue(20);
      prisma.order.aggregate
        .mockResolvedValueOnce({ _sum: { grandTotal: 500.5 } })  // totalRevenue
        .mockResolvedValueOnce({ _sum: { grandTotal: 100 } });   // revenueToday
      prisma.$queryRaw.mockResolvedValue([{ count: BigInt(3) }]);

      const result = await service.getSummary();

      expect(result.totalOrders).toBe(10);
      expect(result.totalCustomers).toBe(5);
      expect(result.totalProducts).toBe(20);
      expect(result.totalRevenue).toBe(500.5);
      expect(result.totalPendingOrders).toBe(2);
      expect(result.totalCancelledOrders).toBe(1);
      expect(result.totalLowStockProducts).toBe(3);
      expect(result.revenueToday).toBe(100);
      expect(result.ordersToday).toBe(3);
      expect(result.customersToday).toBe(1);
    });

    it('returns 0 for revenue when no paid orders', async () => {
      prisma.order.count.mockResolvedValue(0);
      prisma.customer.count.mockResolvedValue(0);
      prisma.product.count.mockResolvedValue(0);
      prisma.order.aggregate.mockResolvedValue({ _sum: { grandTotal: null } });
      prisma.$queryRaw.mockResolvedValue([{ count: BigInt(0) }]);

      const result = await service.getSummary();

      expect(result.totalRevenue).toBe(0);
      expect(result.revenueToday).toBe(0);
    });
  });
});
