import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    listSuppliers(restaurantId: string): Promise<({
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
    })[]>;
    createSupplier(restaurantId: string, data: {
        name: string;
        phone?: string;
        email?: string;
        note?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        restaurantId: string;
        note: string | null;
    }>;
    updateSupplier(restaurantId: string, id: string, data: {
        name?: string;
        phone?: string;
        email?: string;
        note?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        restaurantId: string;
        note: string | null;
    }>;
    listStock(restaurantId: string): Promise<({
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
    })[]>;
    createStockItem(restaurantId: string, data: {
        name: string;
        unit?: string;
        quantity?: number;
        minQuantity?: number;
        supplierId?: string;
        drinkId?: string;
        extraId?: string;
    }): Promise<{
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
    }>;
    updateStockItem(restaurantId: string, id: string, data: {
        name?: string;
        quantity?: number;
        minQuantity?: number;
        supplierId?: string | null;
        unit?: string;
    }): Promise<{
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
    }>;
    recordDelivery(restaurantId: string, supplierId: string, items: {
        stockItemId: string;
        quantity: number;
    }[], note?: string): Promise<{
        id: string;
        createdAt: Date;
        supplierId: string;
        note: string | null;
    }>;
    deductForOrder(restaurantId: string, orderId: string, items: {
        kind?: string | null;
        options?: Prisma.JsonValue;
        quantity?: number;
    }[]): Promise<void>;
    lowStock(restaurantId: string): Promise<{
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
    }[]>;
}
