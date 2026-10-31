import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MenuItemType } from './menu-item.util';
type MenuItemPayload = {
    name: string;
    price?: number;
    description?: string;
    slug?: string;
    isAvailable?: boolean;
    imageUrl?: string | null;
    categorySlug?: string;
};
export declare class MenuService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    getPublicMenu(slug?: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            slug: string;
            logoUrl: string | null;
            settings: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                primaryColor: string;
                secondaryColor: string;
                phone: string | null;
                email: string | null;
                address: string | null;
                city: string | null;
                workingHours: import("@prisma/client/runtime/library").JsonValue | null;
                deliveryFee: number;
                freeDeliveryMin: number;
                minOrderAmount: number;
                isOpen: boolean;
                cashEnabled: boolean;
                cardEnabled: boolean;
                deliveryEnabled: boolean;
                pickupEnabled: boolean;
                taxRate: number;
                courierPayPerDelivery: number;
                restaurantId: string;
            } | null;
        };
        burgers: {
            categorySlug: string;
            category: {
                id: string;
                slug: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                restaurantId: string;
                isActive: boolean;
                sortOrder: number;
            } | null;
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            categoryId: string | null;
            kind: import(".prisma/client").$Enums.ProductKind;
            description: string | null;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        products: {
            categorySlug: string;
            category: {
                id: string;
                slug: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                restaurantId: string;
                isActive: boolean;
                sortOrder: number;
            } | null;
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            categoryId: string | null;
            kind: import(".prisma/client").$Enums.ProductKind;
            description: string | null;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        breads: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            description: string | null;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        ingredients: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        extras: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        drinks: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        categories: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            isActive: boolean;
            sortOrder: number;
        }[];
    }>;
    adminMenu(restaurantId: string): Promise<{
        products: {
            categorySlug: string;
            category: {
                id: string;
                slug: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                restaurantId: string;
                isActive: boolean;
                sortOrder: number;
            } | null;
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            categoryId: string | null;
            kind: import(".prisma/client").$Enums.ProductKind;
            description: string | null;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        breads: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            description: string | null;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        ingredients: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        extras: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        drinks: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            sortOrder: number;
            price: number;
            imageUrl: string | null;
            isAvailable: boolean;
        }[];
        categories: {
            id: string;
            slug: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            isActive: boolean;
            sortOrder: number;
        }[];
    }>;
    private resolveCategoryId;
    createMenuItem(restaurantId: string, type: MenuItemType, data: MenuItemPayload): Promise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        sortOrder: number;
        price: number;
        imageUrl: string | null;
        isAvailable: boolean;
    }>;
    updateMenuItem(restaurantId: string, type: MenuItemType, id: string, data: MenuItemPayload): Promise<{
        ok: boolean;
    }>;
    deleteMenuItem(restaurantId: string, type: MenuItemType, id: string): Promise<{
        ok: boolean;
    }>;
    createProduct(restaurantId: string, data: Record<string, unknown>): Promise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        sortOrder: number;
        price: number;
        imageUrl: string | null;
        isAvailable: boolean;
    }>;
    updateProduct(restaurantId: string, id: string, data: Record<string, unknown>): Promise<{
        ok: boolean;
    }>;
    deleteProduct(restaurantId: string, id: string): Promise<{
        ok: boolean;
    }>;
}
export {};
