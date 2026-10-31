import { PrismaService } from '../../prisma/prisma.service';
export declare class CouponsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(restaurantId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    create(restaurantId: string, data: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__CouponClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(restaurantId: string, id: string, data: Record<string, unknown>): Promise<{
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
    } | null>;
    remove(restaurantId: string, id: string): Promise<void>;
}
