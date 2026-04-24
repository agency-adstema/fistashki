import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    create(dto: CreateCategoryDto, actorUserId?: string): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateCategoryDto, actorUserId?: string): Promise<any>;
    remove(id: string, actorUserId?: string): Promise<{
        id: string;
    }>;
    findPublicCategories(): Promise<{
        items: any;
    }>;
    findPublicCategory(idOrSlug: string): Promise<any>;
    private formatPublicCategory;
}
