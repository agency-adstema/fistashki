import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { MarkFailedDto } from './dto/mark-failed.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsQueryDto } from './dto/payments-query.dto';
export declare class PaymentsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    private formatPayment;
    create(dto: CreatePaymentDto, actorUserId?: string): Promise<any>;
    findAll(query: PaymentsQueryDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    markPaid(id: string, dto: MarkPaidDto, actorUserId?: string): Promise<any>;
    markFailed(id: string, dto: MarkFailedDto, actorUserId?: string): Promise<any>;
    refund(id: string, dto: RefundPaymentDto, actorUserId?: string): Promise<any>;
}
