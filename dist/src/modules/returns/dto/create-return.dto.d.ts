export declare class ReturnItemInput {
    orderItemId: string;
    quantity: number;
    reason?: string;
}
export declare class CreateReturnDto {
    orderId: string;
    customerId?: string;
    reason: string;
    notes?: string;
    items: ReturnItemInput[];
}
