import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    createTag(dto: CreateTagDto, actorUserId?: string): Promise<{
        id: string;
        key: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
    }>;
    findAllTags(): Promise<{
        id: string;
        key: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
    }[]>;
    findOneTag(id: string): Promise<{
        id: string;
        key: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
    }>;
    updateTag(id: string, dto: UpdateTagDto, actorUserId?: string): Promise<{
        id: string;
        key: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
    }>;
    deleteTag(id: string, actorUserId?: string): Promise<{
        deleted: boolean;
    }>;
    getOrderTags(orderId: string): Promise<{
        id: string;
        key: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
    }[]>;
    assignTag(orderId: string, tagId: string, actorUserId?: string): Promise<{
        id: string;
        key: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
    }>;
    removeTag(orderId: string, tagId: string, actorUserId?: string): Promise<{
        removed: boolean;
    }>;
}
