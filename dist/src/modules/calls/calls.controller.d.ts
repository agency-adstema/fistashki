import { CallsService } from './calls.service';
export declare class CallsController {
    private readonly callsService;
    constructor(callsService: CallsService);
    getAllCalls(page?: string, limit?: string): Promise<{
        message: string;
        data: {
            items: ({
                customer: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    phone: string | null;
                };
                order: {
                    id: string;
                    currency: string;
                    orderNumber: string;
                    grandTotal: import("@prisma/client/runtime/library").Decimal;
                };
                callJob: {
                    error: string | null;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.CallStatus;
                    orderId: string;
                    attempt: number;
                    maxAttempts: number;
                    scheduledAt: Date;
                    startedAt: Date | null;
                    endedAt: Date | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                summary: string | null;
                orderId: string;
                customerId: string;
                callJobId: string;
                duration: number | null;
                outcome: import(".prisma/client").$Enums.CallOutcome | null;
                transcript: import("@prisma/client/runtime/library").JsonValue | null;
                audioUrl: string | null;
            })[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
        message: string;
        data: {
            total: number;
            confirmed: {
                count: number;
                percentage: number;
            };
            upsells: {
                count: number;
                percentage: number;
            };
            failed: {
                count: number;
                percentage: number;
            };
            noAnswer: {
                count: number;
                percentage: number;
            };
        };
    }>;
    getCall(id: string): Promise<{
        message: string;
        data: null;
    } | {
        message: string;
        data: {
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                isActive: boolean;
                notes: string | null;
            };
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
            };
            callJob: {
                error: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.CallStatus;
                orderId: string;
                attempt: number;
                maxAttempts: number;
                scheduledAt: Date;
                startedAt: Date | null;
                endedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            summary: string | null;
            orderId: string;
            customerId: string;
            callJobId: string;
            duration: number | null;
            outcome: import(".prisma/client").$Enums.CallOutcome | null;
            transcript: import("@prisma/client/runtime/library").JsonValue | null;
            audioUrl: string | null;
        };
    }>;
    retryCall(id: string, user: any): Promise<{
        message: string;
        data: {
            error: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CallStatus;
            orderId: string;
            attempt: number;
            maxAttempts: number;
            scheduledAt: Date;
            startedAt: Date | null;
            endedAt: Date | null;
        };
    }>;
}
