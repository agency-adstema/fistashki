import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(dto: CreateCategoryDto, user: any): Promise<{
        message: string;
        data: {
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
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: ({
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
        })[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    update(id: string, dto: UpdateCategoryDto, user: any): Promise<{
        message: string;
        data: {
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
        };
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
