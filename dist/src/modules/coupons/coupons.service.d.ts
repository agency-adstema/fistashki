import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponsQueryDto } from './dto/coupons-query.dto';
export declare class CouponsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    private formatCoupon;
    create(dto: CreateCouponDto, actorUserId?: string): Promise<any>;
    findAll(query: CouponsQueryDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    findByCode(code: string): Promise<any>;
    update(id: string, dto: UpdateCouponDto, actorUserId?: string): Promise<any>;
    remove(id: string, actorUserId?: string): Promise<{
        deleted: boolean;
    }>;
    validateForCart(code: string, subtotal: Prisma.Decimal, customerId?: string): Promise<{
        coupon: ReturnType<CouponsService['formatCoupon']>;
        discount: Prisma.Decimal;
    }>;
}
