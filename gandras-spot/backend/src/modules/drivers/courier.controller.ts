import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriverStatus, UserRole } from '@prisma/client';
import { CourierService } from './courier.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthUser, RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('courier')
@Controller('courier')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COURIER)
@ApiBearerAuth('access-token')
export class CourierController {
  constructor(private courier: CourierService) {}

  @Get('me')
  @ApiOperation({ summary: 'Courier profile' })
  me(@RestaurantId() restaurantId: string, @CurrentUser() user: AuthUser) {
    return this.courier.profile(restaurantId, user.id).then((data) => ({ success: true, data }));
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Queue, active deliveries and earnings' })
  dashboard(@RestaurantId() restaurantId: string, @CurrentUser() user: AuthUser) {
    return this.courier.dashboard(restaurantId, user.id).then((data) => ({ success: true, data }));
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Earnings by period' })
  earnings(@RestaurantId() restaurantId: string, @CurrentUser() user: AuthUser) {
    return this.courier.earnings(restaurantId, user.id).then((data) => ({ success: true, data }));
  }

  @Patch('orders/:id/claim')
  @ApiOperation({ summary: 'Take delivery from queue' })
  claim(
    @RestaurantId() restaurantId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.courier.claim(restaurantId, user.id, id).then((data) => ({ success: true, data }));
  }

  @Patch('orders/:id/complete')
  @ApiOperation({ summary: 'Mark delivery completed' })
  complete(
    @RestaurantId() restaurantId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.courier.complete(restaurantId, user.id, id).then((data) => ({ success: true, data }));
  }

  @Patch('status')
  @ApiOperation({ summary: 'Set online/offline status' })
  status(
    @RestaurantId() restaurantId: string,
    @CurrentUser() user: AuthUser,
    @Body('status') status: DriverStatus,
  ) {
    return this.courier.setStatus(restaurantId, user.id, status).then((data) => ({ success: true, data }));
  }
}
