import { CallsService } from './calls.service';
export declare class CallsController {
    private readonly callsService;
    constructor(callsService: CallsService);
    getAllCalls(page?: string, limit?: string): Promise<{
        message: string;
        data: {
            items: ({
                callJob: {
                    error: string | null;
                    id: string;
                    orderId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.CallStatus;
                    attempt: number;
                    maxAttempts: number;
                    scheduledAt: Date;
                    startedAt: Date | null;
                    endedAt: Date | null;
                };
                order: {
                    id: string;
                    orderNumber: string;
                    grandTotal: import("@prisma/client/runtime/library").Decimal;
                    currency: string;
                };
                customer: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    phone: string | null;
                };
            } & {
                id: string;
                callJobId: string;
                orderId: string;
                customerId: string;
                duration: number | null;
                outcome: import(".prisma/client").$Enums.CallOutcome | null;
                transcript: import("@prisma/client/runtime/library").JsonValue | null;
                summary: string | null;
                audioUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
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
            callJob: {
                error: string | null;
                id: string;
                orderId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.CallStatus;
                attempt: number;
                maxAttempts: number;
                scheduledAt: Date;
                startedAt: Date | null;
                endedAt: Date | null;
            };
            order: {
                id: string;
                orderNumber: string;
                grandTotal: import("@prisma/client/runtime/library").Decimal;
                currency: string;
            };
            customer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                phone: string | null;
            };
        } & {
            id: string;
            callJobId: string;
            orderId: string;
            customerId: string;
            duration: number | null;
            outcome: import(".prisma/client").$Enums.CallOutcome | null;
            transcript: import("@prisma/client/runtime/library").JsonValue | null;
            summary: string | null;
            audioUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    retryCall(callLogId: string, user: any): Promise<{
        message: string;
        data: null;
    } | {
        message: string;
        data: {
            error: string | null;
            id: string;
            orderId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CallStatus;
            attempt: number;
            maxAttempts: number;
            scheduledAt: Date;
            startedAt: Date | null;
            endedAt: Date | null;
        };
    }>;
}
