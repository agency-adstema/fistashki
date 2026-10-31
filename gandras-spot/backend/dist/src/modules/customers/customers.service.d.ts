import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    list(restaurantId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string | null;
        phone: string;
        orderCount: number;
        totalSpent: number;
        avgCheck: number;
        lastOrderAt: Date;
        createdAt: Date;
    }[]>;
    findOne(restaurantId: string, id: string): import(".prisma/client").Prisma.Prisma__CustomerClient<({
        orders: {
            id: string;
            createdAt: Date;
            deliveryFee: number;
            restaurantId: string;
            customerAddress: string | null;
            orderNumber: number;
            displayRef: string | null;
            publicToken: string;
            customerId: string | null;
            couponId: string | null;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerCity: string | null;
            customerNote: string | null;
            internalNote: string | null;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            status: import(".prisma/client").$Enums.OrderStatus;
            subtotal: number;
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
        addresses: {
            id: string;
            createdAt: Date;
            address: string;
            city: string | null;
            customerId: string;
            label: string | null;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        restaurantId: string;
        firstName: string;
        lastName: string | null;
        orderCount: number;
        totalSpent: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
