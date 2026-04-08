import { PaymentMethod, PaymentProvider } from '@prisma/client';
export declare class CreatePaymentDto {
    orderId: string;
    method: PaymentMethod;
    provider: PaymentProvider;
    amount?: number;
    currency?: string;
    providerTransactionId?: string;
    metadata?: Record<string, any>;
}
