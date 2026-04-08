export declare class CreateShipmentDto {
    orderId: string;
    shippingMethodId?: string;
    courier?: string;
    service?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
