import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CallsService } from '../calls/calls.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateFulfillmentStatusDto } from './dto/update-fulfillment-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly auditLogsService;
    private readonly callsService;
    private readonly logger;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService, callsService: CallsService);
    private formatOrder;
    private assertOrderStatusTransition;
    create(dto: CreateOrderDto, actorUserId?: string): Promise<any>;
    findAll(query: OrdersQueryDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    updateStatus(id: string, dto: UpdateOrderStatusDto, actorUserId?: string): Promise<any>;
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto, actorUserId?: string): Promise<any>;
    updateFulfillmentStatus(id: string, dto: UpdateFulfillmentStatusDto, actorUserId?: string): Promise<any>;
    cancelOrder(id: string, dto: CancelOrderDto, actorUserId?: string): Promise<any>;
    deleteOrder(id: string, actorUserId?: string): Promise<void>;
}
