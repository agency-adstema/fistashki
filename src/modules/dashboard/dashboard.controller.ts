import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
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

  @Get('sales-overview')
  @Permissions('dashboard.read')
  @ApiOperation({
    summary: 'Sales overview: this month vs last month daily paid revenue (aligned by day of month)',
  })
  async getSalesOverview() {
    const data = await this.dashboardService.getSalesOverviewComparison();
    return { message: 'Sales overview fetched successfully', data };
  }

  @Get('revenue-trend')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get daily revenue and order trend for a period or date range' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'YYYY-MM-DD' })
  async getRevenueTrend(
    @Query('period') period?: '7d' | '30d' | '90d',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    if (dateFrom && dateTo) {
      const data = await this.dashboardService.getRevenueTrend({
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
      return { message: 'Revenue trend fetched successfully', data };
    }
    const validPeriod = ['7d', '30d', '90d'].includes(period as string)
      ? (period as '7d' | '30d' | '90d')
      : '30d';
    const data = await this.dashboardService.getRevenueTrend({ period: validPeriod });
    return { message: 'Revenue trend fetched successfully', data };
  }

  @Get('top-products')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get top products by revenue from paid orders' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const data = await this.dashboardService.getTopProducts(Math.min(limit, 50));
    return { message: 'Top products fetched successfully', data };
  }

  @Get('top-customers')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get top customers by total spend on paid orders' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopCustomers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const data = await this.dashboardService.getTopCustomers(Math.min(limit, 50));
    return { message: 'Top customers fetched successfully', data };
  }
}
