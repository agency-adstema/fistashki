import { NetworkOrdersService } from './network-orders.service';
import { CreateNetworkOrderDto, ConfirmNetworkOrderDto, NetworkOrderResponseDto } from './dto/create-network-order.dto';
export declare class NetworkOrdersController {
    private readonly service;
    constructor(service: NetworkOrdersService);
    createOrder(networkKey: string, dto: CreateNetworkOrderDto): Promise<{
        success: boolean;
        data: NetworkOrderResponseDto;
        message: string;
    }>;
    getOrder(externalId: string, networkKey: string): Promise<{
        success: boolean;
        data: NetworkOrderResponseDto;
    }>;
    confirmOrder(networkOrderId: string, dto: ConfirmNetworkOrderDto): Promise<{
        success: boolean;
        data: NetworkOrderResponseDto;
        message: string;
    }>;
    listOrders(query: {
        status?: string;
        networkKey?: string;
    }): Promise<{
        success: boolean;
        data: ({
            order: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.OrderStatus;
                currency: string;
                notes: string | null;
                customerId: string;
                orderNumber: string;
                shippingAddressId: string | null;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
                priority: import(".prisma/client").$Enums.OrderPriority;
                assignedToUserId: string | null;
                assignedAt: Date | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountTotal: import("@prisma/client/runtime/library").Decimal;
                shippingTotal: import("@prisma/client/runtime/library").Decimal;
                grandTotal: import("@prisma/client/runtime/library").Decimal;
                cancelledAt: Date | null;
                cancelReason: string | null;
                networkOrderId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            items: string;
            status: import(".prisma/client").$Enums.NetworkOrderStatus;
            currency: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            externalId: string;
            customerEmail: string;
            customerPhone: string;
            customerName: string;
            confirmationUrl: string | null;
            webhookUrl: string | null;
            networkKey: string;
            networkName: string;
            productsSku: string[];
            confirmedAt: Date | null;
        })[];
        count: number;
    }>;
}
