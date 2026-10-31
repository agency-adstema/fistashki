import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventory;
    constructor(inventory: InventoryService);
    suppliers(restaurantId: string): Promise<{
        success: boolean;
        data: ({
            stockItems: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                restaurantId: string;
                drinkId: string | null;
                extraId: string | null;
                supplierId: string | null;
                unit: string;
                quantity: number;
                minQuantity: number;
            }[];
            _count: {
                deliveries: number;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            email: string | null;
            restaurantId: string;
            note: string | null;
        })[];
    }>;
    createSupplier(restaurantId: string, body: {
        name: string;
        phone?: string;
        email?: string;
        note?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            email: string | null;
            restaurantId: string;
            note: string | null;
        };
    }>;
    updateSupplier(restaurantId: string, id: string, body: {
        name?: string;
        phone?: string;
        email?: string;
        note?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            email: string | null;
            restaurantId: string;
            note: string | null;
        };
    }>;
    stock(restaurantId: string): Promise<{
        success: boolean;
        data: ({
            extra: {
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
            } | null;
            drink: {
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
            } | null;
            supplier: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                email: string | null;
                restaurantId: string;
                note: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            drinkId: string | null;
            extraId: string | null;
            supplierId: string | null;
            unit: string;
            quantity: number;
            minQuantity: number;
        })[];
    }>;
    createStock(restaurantId: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: {
            extra: {
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
            } | null;
            drink: {
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
            } | null;
            supplier: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                email: string | null;
                restaurantId: string;
                note: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            drinkId: string | null;
            extraId: string | null;
            supplierId: string | null;
            unit: string;
            quantity: number;
            minQuantity: number;
        };
    }>;
    updateStock(restaurantId: string, id: string, body: {
        name?: string;
        quantity?: number;
        minQuantity?: number;
        supplierId?: string | null;
        unit?: string;
    }): Promise<{
        success: boolean;
        data: {
            extra: {
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
            } | null;
            drink: {
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
            } | null;
            supplier: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                email: string | null;
                restaurantId: string;
                note: string | null;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            drinkId: string | null;
            extraId: string | null;
            supplierId: string | null;
            unit: string;
            quantity: number;
            minQuantity: number;
        };
    }>;
    delivery(restaurantId: string, body: {
        supplierId: string;
        note?: string;
        items: {
            stockItemId: string;
            quantity: number;
        }[];
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            supplierId: string;
            note: string | null;
        };
    }>;
    lowStock(restaurantId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            drinkId: string | null;
            extraId: string | null;
            supplierId: string | null;
            unit: string;
            quantity: number;
            minQuantity: number;
        }[];
    }>;
}
