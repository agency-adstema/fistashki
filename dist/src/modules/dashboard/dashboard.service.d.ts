import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        totalRevenue: number;
        totalPendingOrders: number;
        totalCancelledOrders: number;
        totalLowStockProducts: number;
        revenueToday: number;
        ordersToday: number;
        customersToday: number;
        revenueChangePercent: number;
        ordersChangePercent: number;
        customersChangePercent: number;
        conversionRate: number;
        conversionRateChange: number;
    }>;
    getLowStock(): Promise<{
        price: number;
        deficit: number;
        id: string;
        name: string;
        sku: string;
        slug: string;
        stockQuantity: number;
        lowStockThreshold: number;
        isActive: boolean;
    }[]>;
    getRecentActivity(limit?: number): Promise<({
        actor: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string | null;
        metadata: Prisma.JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        actorUserId: string | null;
    })[]>;
    getRevenueTrend(period?: '7d' | '30d' | '90d'): Promise<{
        date: string;
        revenue: number;
        orders: number;
    }[]>;
    getTopProducts(limit?: number): Promise<{
        productId: string;
        productName: string;
        sku: string;
        totalRevenue: number;
        totalQuantity: number;
        orderCount: number;
    }[]>;
    getTopCustomers(limit?: number): Promise<{
        customerId: string;
        firstName: string;
        lastName: string;
        email: string;
        totalSpend: number;
        orderCount: number;
    }[]>;
}
