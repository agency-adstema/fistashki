import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboard;
    constructor(dashboard: DashboardService);
    get(restaurantId: string): Promise<{
        success: boolean;
        data: {
            stats: {
                totalOrders: number;
                activeOrders: number;
                completedOrders: number;
                cancelledOrders: number;
                revenue: number;
                revenueChangePercent: number;
                avgOrderValue: number;
                deliveries: number;
                pickups: number;
                topProducts: {
                    name: string;
                    count: number;
                    revenue: number;
                }[];
            };
            revenueByDay: {
                label: string;
                revenue: number;
                orders: number;
            }[];
            recentOrders: {
                id: string;
                displayId: string;
                token: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                total: number;
                customer: {
                    firstName: string;
                    phone: string;
                };
                deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                createdAt: Date;
            }[];
        };
    }>;
}
