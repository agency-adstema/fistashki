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
}
