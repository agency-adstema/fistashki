import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('coupons')
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth('access-token')
export class CouponsController {
  constructor(private coupons: CouponsService) {}

  @Get()
  list(@RestaurantId() restaurantId: string) {
    return this.coupons.list(restaurantId).then((data) => ({ success: true, data }));
  }

  @Post()
  create(@RestaurantId() restaurantId: string, @Body() body: Record<string, unknown>) {
    return this.coupons.create(restaurantId, body).then((data) => ({ success: true, data }));
  }

  @Patch(':id')
  update(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.coupons.update(restaurantId, id, body).then((data) => ({ success: true, data }));
  }

  @Delete(':id')
  remove(@RestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.coupons.remove(restaurantId, id).then(() => ({ success: true }));
  }
}
