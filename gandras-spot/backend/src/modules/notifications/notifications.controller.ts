import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('notifications')
@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@RestaurantId() restaurantId: string, @Query('unread') unread?: string) {
    return this.notifications
      .list(restaurantId, unread === 'true')
      .then((data) => ({ success: true, data }));
  }

  @Get('count')
  async count(@RestaurantId() restaurantId: string) {
    const count = await this.notifications.unreadCount(restaurantId);
    return { success: true, data: { count } };
  }

  @Patch(':id/read')
  read(@RestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.notifications.markRead(restaurantId, id).then(() => ({ success: true }));
  }
}
