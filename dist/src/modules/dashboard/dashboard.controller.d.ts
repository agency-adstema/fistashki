import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getLowStock(): Promise<{
        message: string;
        data: {
            price: number;
            deficit: number;
            id: string;
            name: string;
            sku: string;
            slug: string;
            stockQuantity: number;
            lowStockThreshold: number;
            isActive: boolean;
        }[];
    }>;
    getRecentActivity(limit?: number): Promise<{
        message: string;
        data: ({
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            actorUserId: string | null;
        })[];
    }>;
}
