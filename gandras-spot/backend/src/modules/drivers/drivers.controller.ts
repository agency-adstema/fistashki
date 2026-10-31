import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DriverStatus, UserRole } from '@prisma/client';
import { DriversService } from './drivers.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('drivers')
@Controller('admin/drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth('access-token')
export class DriversController {
  constructor(private drivers: DriversService) {}

  @Get()
  list(@RestaurantId() restaurantId: string) {
    return this.drivers.list(restaurantId).then((data) => ({ success: true, data }));
  }

  @Post('courier-account')
  createCourier(@RestaurantId() restaurantId: string, @Body() body: CreateCourierDto) {
    return this.drivers.createCourierAccount(restaurantId, body).then((data) => ({ success: true, data }));
  }

  @Post()
  create(@RestaurantId() restaurantId: string, @Body() body: Record<string, unknown>) {
    return this.drivers.create(restaurantId, body).then((data) => ({ success: true, data }));
  }

  @Patch(':id')
  update(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.drivers.update(restaurantId, id, body).then((data) => ({ success: true, data }));
  }

  @Patch(':id/status')
  status(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body('status') status: DriverStatus,
  ) {
    return this.drivers.setStatus(restaurantId, id, status).then((data) => ({ success: true, data }));
  }

  @Patch(':id/courier-account')
  updateCourier(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body: UpdateCourierDto,
  ) {
    return this.drivers.updateCourierAccount(restaurantId, id, body).then((data) => ({ success: true, data }));
  }

  @Delete(':id')
  remove(@RestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.drivers.remove(restaurantId, id).then((data) => ({ success: true, data }));
  }
}
