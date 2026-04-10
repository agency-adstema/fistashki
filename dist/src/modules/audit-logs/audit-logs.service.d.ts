import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditLogsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(dto: CreateAuditLogDto): Promise<void>;
    findAll(page?: number, limit?: number): Promise<{
        items: ({
            actor: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            actorUserId: string | null;
            action: string;
            entityType: string;
            entityId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findByEntity(entityType: string, entityId: string): Promise<({
        actor: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        actorUserId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
}
