import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private orders;
    private prisma;
    constructor(orders: OrdersService, prisma: PrismaService);
    getDashboard(restaurantId: string): Promise<{
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
    }>;
    private revenueLast7Days;
    topCustomers(restaurantId: string, limit?: number): Promise<({
        orders: {
            id: string;
            restaurantId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            orderNumber: number;
            displayRef: string | null;
            publicToken: string;
            customerId: string | null;
            couponId: string | null;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            internalNote: string | null;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedReadyAt: Date | null;
            estimatedMinutes: number | null;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
        }[];
    } & {
        id: string;
        restaurantId: string;
        firstName: string;
        lastName: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        orderCount: number;
        totalSpent: number;
    })[]>;
}
