export declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    customerId: string;
    shippingAddressId?: string;
    items: OrderItemDto[];
    notes?: string;
    shippingTotal?: number;
    discountTotal?: number;
    currency?: string;
}
