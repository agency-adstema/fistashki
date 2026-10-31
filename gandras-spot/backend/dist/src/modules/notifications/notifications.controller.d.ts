import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notifications;
    constructor(notifications: NotificationsService);
    list(restaurantId: string, unread?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            restaurantId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            orderId: string | null;
            title: string;
            message: string;
            isRead: boolean;
        }[];
    }>;
    count(restaurantId: string): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    read(restaurantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
