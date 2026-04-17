export declare class CreateNetworkOrderDto {
    externalId: string;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
    items: Array<{
        sku: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    currency?: string;
    notes?: string;
    confirmationUrl?: string;
    webhookUrl?: string;
}
export declare class ConfirmNetworkOrderDto {
    status: 'CONFIRMED' | 'REJECTED';
    message?: string;
}
export declare class NetworkOrderResponseDto {
    id: string;
    externalId: string;
    status: string;
    customerEmail: string;
    customerName: string;
    totalAmount: number;
    currency: string;
    createdAt: Date;
    confirmedAt?: Date;
    order?: {
        id: string;
        orderNumber: string;
        status: string;
    };
}
