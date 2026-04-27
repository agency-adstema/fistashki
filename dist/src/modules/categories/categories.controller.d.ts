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
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: ({
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
        })[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    update(id: string, dto: UpdateCategoryDto, user: any): Promise<{
        message: string;
        data: {
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
        };
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
