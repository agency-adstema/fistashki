import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { RejectReturnDto } from './dto/reject-return.dto';
import { ReturnsQueryDto } from './dto/returns-query.dto';
export declare class ReturnsService {
    private readonly prisma;
    private readonly auditLogsService;
    private readonly paymentsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService, paymentsService: PaymentsService);
    private formatReturn;
    create(dto: CreateReturnDto, actorUserId?: string): Promise<any>;
    findAll(query: ReturnsQueryDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    approve(id: string, actorUserId?: string): Promise<any>;
    reject(id: string, dto: RejectReturnDto, actorUserId?: string): Promise<any>;
    markReceived(id: string, actorUserId?: string): Promise<any>;
    markRefundPending(id: string, actorUserId?: string): Promise<any>;
    refund(id: string, actorUserId?: string): Promise<any>;
    complete(id: string, actorUserId?: string): Promise<any>;
    cancel(id: string, actorUserId?: string): Promise<any>;
}
