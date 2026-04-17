import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AssignOrderDto } from './dto/assign-order.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { TimelineQueryDto } from './dto/timeline-query.dto';
export declare class AdminOpsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    assignOrder(orderId: string, dto: AssignOrderDto, actorUserId?: string): Promise<{
        assignedTo: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
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
    }>;
    unassignOrder(orderId: string, actorUserId?: string): Promise<{
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
    }>;
    setPriority(orderId: string, dto: SetPriorityDto, actorUserId?: string): Promise<{
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
    }>;
    getTimeline(orderId: string, query: TimelineQueryDto): Promise<{
        type: string;
        label: string;
        timestamp: Date;
        entityType: string;
        entityId: string | null;
        actor: {
            id: string;
            name: string;
            email: string;
        } | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
