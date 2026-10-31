import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  list(restaurantId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { restaurantId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(restaurantId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, restaurantId },
      data: { isRead: true },
    });
  }

  unreadCount(restaurantId: string) {
    return this.prisma.notification.count({ where: { restaurantId, isRead: false } });
  }
}
