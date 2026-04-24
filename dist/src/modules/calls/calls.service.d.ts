import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class CallsService {
    private callsQueue;
    private prisma;
    private auditLogsService;
    private readonly logger;
    constructor(callsQueue: Queue, prisma: PrismaService, auditLogsService: AuditLogsService);
    scheduleCall(orderId: string, delaySeconds?: number): Promise<{
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
    } | undefined>;
    getCallLog(id: string): Promise<({
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
    }) | null>;
    getCallsByCustomer(customerId: string): Promise<({
        order: {
            status: import(".prisma/client").$Enums.OrderStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
    })[]>;
    getCallsByOrder(orderId: string): Promise<({
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
    })[]>;
    getAllCalls(page?: number, limit?: number): Promise<{
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
    }>;
    getCallStats(): Promise<{
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
    }>;
    retryCall(callJobId: string, actorUserId?: string): Promise<{
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
    }>;
}
