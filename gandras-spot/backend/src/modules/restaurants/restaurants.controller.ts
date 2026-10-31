import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('settings')
@Controller()
export class RestaurantsController {
  constructor(private restaurants: RestaurantsService) {}

  @Get('restaurant')
  async publicInfo() {
    const data = await this.restaurants.getPublic();
    return { success: true, data };
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  settings(@RestaurantId() restaurantId: string) {
    return this.restaurants.getSettings(restaurantId).then((data) => ({ success: true, data }));
  }

  @Patch('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  update(@RestaurantId() restaurantId: string, @Body() body: Record<string, unknown>) {
    return this.restaurants.updateSettings(restaurantId, body).then((data) => ({ success: true, data }));
  }
}
