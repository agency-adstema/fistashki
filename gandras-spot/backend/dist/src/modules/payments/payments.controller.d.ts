import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private payments;
    constructor(payments: PaymentsService);
    createIntent(orderId: string): Promise<{
        success: boolean;
        data: {
            clientSecret: string | null;
            paymentIntentId: string;
        };
    }>;
}
export declare class WebhooksController {
    private payments;
    constructor(payments: PaymentsService);
    stripe(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
