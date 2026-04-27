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
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        }[];
        parent: {
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        name: string;
        parentId: string | null;
        sortOrder: number;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
    }>;
    findAll(): Promise<({
        children: {
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        }[];
        _count: {
            productCategories: number;
        };
        parent: {
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        name: string;
        parentId: string | null;
        sortOrder: number;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
    })[]>;
    findOne(id: string): Promise<{
        children: {
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        }[];
        _count: {
            productCategories: number;
        };
        parent: {
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        name: string;
        parentId: string | null;
        sortOrder: number;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
    }>;
    update(id: string, dto: UpdateCategoryDto, actorUserId?: string): Promise<{
        children: {
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        }[];
        _count: {
            productCategories: number;
        };
        parent: {
            description: string | null;
            id: string;
            name: string;
            parentId: string | null;
            sortOrder: number;
            image: string | null;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
        } | null;
    } & {
        description: string | null;
        id: string;
        name: string;
        parentId: string | null;
        sortOrder: number;
        image: string | null;
        seoTitle: string | null;
        seoDescription: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
    }>;
    remove(id: string, actorUserId?: string): Promise<{
        id: string;
    }>;
    findPublicCategoriesNav(): Promise<{
        items: {
            name: string;
            slug: string;
        }[];
    }>;
    findPublicCategories(): Promise<{
        items: any[];
    }>;
    findPublicCategory(idOrSlug: string): Promise<any>;
    private formatPublicCategory;
}
