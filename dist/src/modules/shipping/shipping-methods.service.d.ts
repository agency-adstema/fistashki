import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
export declare class ShippingMethodsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    private formatMethod;
    create(dto: CreateShippingMethodDto, actorUserId?: string): Promise<any>;
    findAll(isActive?: boolean): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateShippingMethodDto, actorUserId?: string): Promise<any>;
    remove(id: string, actorUserId?: string): Promise<{
        deleted: boolean;
    }>;
}
