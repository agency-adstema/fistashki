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
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        } | null;
        children: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            productCategories: number;
        };
        parent: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        } | null;
        children: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            productCategories: number;
        };
        parent: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        } | null;
        children: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
    }>;
    update(id: string, dto: UpdateCategoryDto, actorUserId?: string): Promise<{
        _count: {
            productCategories: number;
        };
        parent: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        } | null;
        children: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
        seoTitle: string | null;
        seoDescription: string | null;
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
