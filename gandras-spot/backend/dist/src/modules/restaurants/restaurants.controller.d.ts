import { RestaurantsService } from './restaurants.service';
export declare class RestaurantsController {
    private restaurants;
    constructor(restaurants: RestaurantsService);
    publicInfo(): Promise<{
        success: boolean;
        data: ({
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
        }) | null;
    }>;
    settings(restaurantId: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    update(restaurantId: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
}
