import { OrdersService } from './orders.service';
export declare class KitchenController {
    private orders;
    constructor(orders: OrdersService);
    active(restaurantId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            customerNote: string | null;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            items: {
                name: string;
                quantity: number;
                note: string | null;
                kind: string | null;
                options: import("@prisma/client/runtime/library").JsonValue;
            }[];
            createdAt: Date;
        }[];
    }>;
    delivery(restaurantId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            total: number;
            items: {
                name: string;
                quantity: number;
                totalPrice: number;
                kind: string | null;
                options: import("@prisma/client/runtime/library").JsonValue;
            }[];
            createdAt: Date;
        }[];
    }>;
}
