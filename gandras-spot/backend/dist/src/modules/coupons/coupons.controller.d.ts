import { CouponsService } from './coupons.service';
export declare class CouponsController {
    private coupons;
    constructor(coupons: CouponsService);
    list(restaurantId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            minOrderAmount: number;
            restaurantId: string;
            isActive: boolean;
            code: string;
            percentOff: number | null;
            fixedOff: number | null;
            freeDelivery: boolean;
            maxUses: number | null;
            usedCount: number;
            validFrom: Date | null;
            validUntil: Date | null;
        }[];
    }>;
    create(restaurantId: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            minOrderAmount: number;
            restaurantId: string;
            isActive: boolean;
            code: string;
            percentOff: number | null;
            fixedOff: number | null;
            freeDelivery: boolean;
            maxUses: number | null;
            usedCount: number;
            validFrom: Date | null;
            validUntil: Date | null;
        };
    }>;
    update(restaurantId: string, id: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            minOrderAmount: number;
            restaurantId: string;
            isActive: boolean;
            code: string;
            percentOff: number | null;
            fixedOff: number | null;
            freeDelivery: boolean;
            maxUses: number | null;
            usedCount: number;
            validFrom: Date | null;
            validUntil: Date | null;
        } | null;
    }>;
    remove(restaurantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
