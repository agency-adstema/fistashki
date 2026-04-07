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
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                slug: string;
                parentId: string | null;
                sortOrder: number;
            } | null;
            children: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                slug: string;
                parentId: string | null;
                sortOrder: number;
            }[];
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            parentId: string | null;
            sortOrder: number;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: ({
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
                parentId: string | null;
                sortOrder: number;
            } | null;
            children: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                slug: string;
                parentId: string | null;
                sortOrder: number;
            }[];
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            parentId: string | null;
            sortOrder: number;
        })[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
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
                parentId: string | null;
                sortOrder: number;
            } | null;
            children: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                slug: string;
                parentId: string | null;
                sortOrder: number;
            }[];
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            parentId: string | null;
            sortOrder: number;
        };
    }>;
    update(id: string, dto: UpdateCategoryDto, user: any): Promise<{
        message: string;
        data: {
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
                parentId: string | null;
                sortOrder: number;
            } | null;
            children: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                slug: string;
                parentId: string | null;
                sortOrder: number;
            }[];
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string;
            parentId: string | null;
            sortOrder: number;
        };
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
