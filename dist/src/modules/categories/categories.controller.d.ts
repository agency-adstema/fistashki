import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(dto: CreateCategoryDto, user: any): Promise<{
        message: string;
        data: {
            parent: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            } | null;
            children: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: ({
            parent: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            } | null;
            children: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            }[];
            _count: {
                productCategories: number;
            };
        } & {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        })[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
            parent: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            } | null;
            children: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            }[];
            _count: {
                productCategories: number;
            };
        } & {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
    }>;
    update(id: string, dto: UpdateCategoryDto, user: any): Promise<{
        message: string;
        data: {
            parent: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            } | null;
            children: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                isActive: boolean;
                sortOrder: number;
                seoTitle: string | null;
                seoDescription: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            }[];
            _count: {
                productCategories: number;
            };
        } & {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            isActive: boolean;
            sortOrder: number;
            seoTitle: string | null;
            seoDescription: string | null;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
