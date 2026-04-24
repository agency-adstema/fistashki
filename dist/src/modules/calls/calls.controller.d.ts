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
                } | null;
                callJob: {
                    error: string | null;
                    status: import(".prisma/client").$Enums.CallStatus;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    orderId: string;
                    attempt: number;
                    maxAttempts: number;
                    scheduledAt: Date;
                    startedAt: Date | null;
                    endedAt: Date | null;
                } | null;
            } & {
                id: string;
                summary: string | null;
                createdAt: Date;
                updatedAt: Date;
                orderId: string | null;
                customerId: string;
                callJobId: string | null;
                duration: number | null;
                outcome: import(".prisma/client").$Enums.CallOutcome | null;
                transcript: import("@prisma/client/runtime/library").JsonValue | null;
                audioUrl: string | null;
                latencyMs: number | null;
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
            } | null;
            callJob: {
                error: string | null;
                status: import(".prisma/client").$Enums.CallStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                attempt: number;
                maxAttempts: number;
                scheduledAt: Date;
                startedAt: Date | null;
                endedAt: Date | null;
            } | null;
        } & {
            id: string;
            summary: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string | null;
            customerId: string;
            callJobId: string | null;
            duration: number | null;
            outcome: import(".prisma/client").$Enums.CallOutcome | null;
            transcript: import("@prisma/client/runtime/library").JsonValue | null;
            audioUrl: string | null;
            latencyMs: number | null;
        };
    }>;
    scheduleCall(orderId: string, delaySeconds?: number): Promise<{
        message: string;
        data: {
            error: string | null;
            status: import(".prisma/client").$Enums.CallStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            attempt: number;
            maxAttempts: number;
            scheduledAt: Date;
            startedAt: Date | null;
            endedAt: Date | null;
        } | undefined;
    }>;
    retryCall(callLogId: string, user: any): Promise<{
        message: string;
        data: null;
    } | {
        message: string;
        data: {
            error: string | null;
            status: import(".prisma/client").$Enums.CallStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            attempt: number;
            maxAttempts: number;
            scheduledAt: Date;
            startedAt: Date | null;
            endedAt: Date | null;
        };
    }>;
}
