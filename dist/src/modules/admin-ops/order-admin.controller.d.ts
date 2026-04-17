import { TagsService } from './tags.service';
import { AdminOpsService } from './admin-ops.service';
import { AssignOrderDto } from './dto/assign-order.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { TimelineQueryDto } from './dto/timeline-query.dto';
export declare class OrderAdminController {
    private readonly adminOpsService;
    private readonly tagsService;
    constructor(adminOpsService: AdminOpsService, tagsService: TagsService);
    getOrderTags(id: string): Promise<{
        data: {
            id: string;
            key: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        }[];
    }>;
    assignTag(id: string, tagId: string, req: any): Promise<{
        data: {
            id: string;
            key: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
        };
    }>;
    removeTag(id: string, tagId: string, req: any): Promise<{
        data: {
            removed: boolean;
        };
    }>;
    assign(id: string, dto: AssignOrderDto, req: any): Promise<{
        data: {
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
        };
    }>;
    unassign(id: string, req: any): Promise<{
        data: {
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
    }>;
    setPriority(id: string, dto: SetPriorityDto, req: any): Promise<{
        data: {
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
    }>;
    getTimeline(id: string, query: TimelineQueryDto): Promise<{
        data: {
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
        }[];
    }>;
}
