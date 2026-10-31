import { MenuService } from './menu.service';
import { MenuItemType } from './menu-item.util';
export declare class MenuController {
    private menu;
    constructor(menu: MenuService);
    publicMenu(): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    adminMenu(restaurantId: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    uploadImage(file?: Express.Multer.File): {
        success: boolean;
        data: {
            url: string;
        };
    };
    createItem(restaurantId: string, type: MenuItemType, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateItem(restaurantId: string, type: MenuItemType, id: string, body: Record<string, unknown>): Promise<{
        success: boolean;
    }>;
    deleteItem(restaurantId: string, type: MenuItemType, id: string): Promise<{
        success: boolean;
    }>;
    create(restaurantId: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    update(restaurantId: string, id: string, body: Record<string, unknown>): Promise<{
        success: boolean;
    }>;
    remove(restaurantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
