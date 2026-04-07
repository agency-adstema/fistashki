import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get admin dashboard summary metrics' })
  async getSummary() {
    const data = await this.dashboardService.getSummary();
    return { message: 'Dashboard summary fetched successfully', data };
  }

  @Get('low-stock')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get products below or at low stock threshold' })
  async getLowStock() {
    const data = await this.dashboardService.getLowStock();
    return { message: 'Low stock products fetched successfully', data };
  }

  @Get('recent-activity')
  @Permissions('audit_logs.read')
  @ApiOperation({ summary: 'Get recent audit log activity (latest 20)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentActivity(@Query('limit') limit?: number) {
    const cap = Math.min(Number(limit ?? 20), 50);
    const data = await this.dashboardService.getRecentActivity(cap);
    return { message: 'Recent activity fetched successfully', data };
  }
}
