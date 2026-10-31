import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('customers')
@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth('access-token')
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Get()
  list(@RestaurantId() restaurantId: string) {
    return this.customers.list(restaurantId).then((data) => ({ success: true, data }));
  }

  @Get(':id')
  one(@RestaurantId() restaurantId: string, @Param('id') id: string) {
    return this.customers.findOne(restaurantId, id).then((data) => ({ success: true, data }));
  }
}
