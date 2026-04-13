import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    create(dto: CreateCategoryDto, actorUserId?: string): Promise<{
        parent: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        children: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        description: string | null;
        name: string;
        slug: string;
        image: string | null;
        parentId: string | null;
        isActive: boolean;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        parent: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        children: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            productCategories: number;
        };
    } & {
        description: string | null;
        name: string;
        slug: string;
        image: string | null;
        parentId: string | null;
        isActive: boolean;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        children: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            productCategories: number;
        };
    } & {
        description: string | null;
        name: string;
        slug: string;
        image: string | null;
        parentId: string | null;
        isActive: boolean;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateCategoryDto, actorUserId?: string): Promise<{
        parent: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        children: {
            description: string | null;
            name: string;
            slug: string;
            image: string | null;
            parentId: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        _count: {
            productCategories: number;
        };
    } & {
        description: string | null;
        name: string;
        slug: string;
        image: string | null;
        parentId: string | null;
        isActive: boolean;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, actorUserId?: string): Promise<{
        id: string;
    }>;
    findPublicCategories(): Promise<{
        items: any[];
    }>;
    findPublicCategory(idOrSlug: string): Promise<any>;
    private formatPublicCategory;
}
