import { AuditLogsService } from './audit-logs.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(query: PaginationDto): Promise<{
        message: string;
        data: {
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
                action: string;
                entityType: string;
                entityId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                ipAddress: string | null;
                userAgent: string | null;
                actorUserId: string | null;
            })[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findByEntity(entityType: string, entityId: string): Promise<{
        message: string;
        data: ({
            actor: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            actorUserId: string | null;
        })[];
    }>;
}
