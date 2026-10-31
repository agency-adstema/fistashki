import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, RestaurantId } from '../../common/decorators/auth.decorators';

@ApiTags('kitchen')
@Controller('kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN)
@ApiBearerAuth('access-token')
export class KitchenController {
  constructor(private orders: OrdersService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Active kitchen orders' })
  async active(@RestaurantId() restaurantId: string) {
    const data = await this.orders.kitchenOrders(restaurantId);
    return { success: true, data };
  }

  @Get('delivery')
  @ApiOperation({ summary: 'Ready orders for delivery dispatch' })
  async delivery(@RestaurantId() restaurantId: string) {
    const data = await this.orders.deliveryOrders(restaurantId);
    return { success: true, data };
  }
}
