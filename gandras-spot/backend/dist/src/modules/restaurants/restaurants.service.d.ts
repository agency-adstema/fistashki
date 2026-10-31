import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class RestaurantsService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    getSettings(restaurantId: string): Promise<{
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
    } & {
        id: string;
        slug: string;
        name: string;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSettings(restaurantId: string, data: Record<string, unknown>): Promise<{
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
    } & {
        id: string;
        slug: string;
        name: string;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPublic(slug?: string): Promise<({
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
    } & {
        id: string;
        slug: string;
        name: string;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
}
