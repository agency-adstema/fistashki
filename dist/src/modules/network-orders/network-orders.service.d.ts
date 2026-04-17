import { PrismaService } from '../../prisma/prisma.service';
import { CreateNetworkOrderDto, ConfirmNetworkOrderDto, NetworkOrderResponseDto } from './dto/create-network-order.dto';
export declare class NetworkOrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(networkKey: string, dto: CreateNetworkOrderDto): Promise<NetworkOrderResponseDto>;
    confirmOrder(orderId: string, networkOrderId: string, dto: ConfirmNetworkOrderDto): Promise<NetworkOrderResponseDto>;
    getOrderByExternalId(externalId: string): Promise<NetworkOrderResponseDto>;
    listOrders(status?: string, networkKey?: string): Promise<({
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
    })[]>;
    private validateNetworkKey;
    private sendWebhookNotification;
    private generateSignature;
    private formatNetworkOrderResponse;
}
