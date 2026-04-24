import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    create(dto: CreateCategoryDto, actorUserId?: string): Promise<{
        children: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        }[];
        parent: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        } | null;
    } & {
        slug: string;
        id: string;
        description: string | null;
        createdAt: Date;
        sortOrder: number;
        name: string;
        parentId: string | null;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        updatedAt: Date;
        isActive: boolean;
    }>;
    findAll(): Promise<({
        children: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        }[];
        _count: {
            productCategories: number;
        };
        parent: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        } | null;
    } & {
        slug: string;
        id: string;
        description: string | null;
        createdAt: Date;
        sortOrder: number;
        name: string;
        parentId: string | null;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        updatedAt: Date;
        isActive: boolean;
    })[]>;
    findOne(id: string): Promise<{
        children: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        }[];
        _count: {
            productCategories: number;
        };
        parent: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        } | null;
    } & {
        slug: string;
        id: string;
        description: string | null;
        createdAt: Date;
        sortOrder: number;
        name: string;
        parentId: string | null;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        updatedAt: Date;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateCategoryDto, actorUserId?: string): Promise<{
        children: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        }[];
        _count: {
            productCategories: number;
        };
        parent: {
            slug: string;
            id: string;
            description: string | null;
            createdAt: Date;
            sortOrder: number;
            name: string;
            parentId: string | null;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            updatedAt: Date;
            isActive: boolean;
        } | null;
    } & {
        slug: string;
        id: string;
        description: string | null;
        createdAt: Date;
        sortOrder: number;
        name: string;
        parentId: string | null;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        updatedAt: Date;
        isActive: boolean;
    }>;
    remove(id: string, actorUserId?: string): Promise<{
        id: string;
    }>;
    findPublicCategoriesNav(): Promise<{
        items: {
            slug: string;
            name: string;
        }[];
    }>;
    findPublicCategories(): Promise<{
        items: any[];
    }>;
    findPublicCategory(idOrSlug: string): Promise<any>;
    private formatPublicCategory;
}
