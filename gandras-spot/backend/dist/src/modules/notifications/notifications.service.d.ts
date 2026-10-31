import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(restaurantId: string, unreadOnly?: boolean): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        restaurantId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        orderId: string | null;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    markRead(restaurantId: string, id: string): Promise<void>;
    unreadCount(restaurantId: string): import(".prisma/client").Prisma.PrismaPromise<number>;
}
