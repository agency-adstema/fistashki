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
                description: string | null;
                name: string;
                slug: string;
                image: string | null;
                parentId: string | null;
                isActive: boolean;
                sortOrder: number;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: ({
            parent: {
                description: string | null;
                name: string;
                slug: string;
                image: string | null;
                parentId: string | null;
                isActive: boolean;
                sortOrder: number;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
            parent: {
                description: string | null;
                name: string;
                slug: string;
                image: string | null;
                parentId: string | null;
                isActive: boolean;
                sortOrder: number;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: string, dto: UpdateCategoryDto, user: any): Promise<{
        message: string;
        data: {
            parent: {
                description: string | null;
                name: string;
                slug: string;
                image: string | null;
                parentId: string | null;
                isActive: boolean;
                sortOrder: number;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
