import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('admin')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async get(@RestaurantId() restaurantId: string) {
    const data = await this.dashboard.getDashboard(restaurantId);
    return { success: true, data };
  }
}
