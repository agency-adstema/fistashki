import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { ShipmentsQueryDto } from './dto/shipments-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('shipments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly service: ShipmentsService) {}

  @Post()
  @Permissions('shipments.create')
  @ApiOperation({ summary: 'Create a shipment for an order' })
  async create(@Body() dto: CreateShipmentDto, @CurrentUser() user: any) {
    const data = await this.service.create(dto, user?.id);
    return { message: 'Shipment created successfully', data };
  }

  @Get()
  @Permissions('shipments.read')
  @ApiOperation({ summary: 'List shipments (paginated, filterable)' })
  async findAll(@Query() query: ShipmentsQueryDto) {
    const data = await this.service.findAll(query);
    return { message: 'Shipments fetched successfully', data };
  }

  @Get(':id')
  @Permissions('shipments.read')
  @ApiOperation({ summary: 'Get shipment by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Shipment fetched successfully', data };
  }

  @Patch(':id/status')
  @Permissions('shipments.update')
  @ApiOperation({ summary: 'Update shipment status (validated transition)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.service.updateStatus(id, dto, user?.id);
    return { message: 'Shipment status updated', data };
  }

  @Patch(':id/tracking')
  @Permissions('shipments.update')
  @ApiOperation({ summary: 'Attach or update tracking information' })
  async updateTracking(
    @Param('id') id: string,
    @Body() dto: UpdateTrackingDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.service.updateTracking(id, dto, user?.id);
    return { message: 'Tracking information updated', data };
  }

  @Post(':id/mark-shipped')
  @Permissions('shipments.update')
  @ApiOperation({ summary: 'Mark shipment as shipped' })
  async markShipped(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.service.markShipped(id, user?.id);
    return { message: 'Shipment marked as shipped', data };
  }

  @Post(':id/mark-delivered')
  @Permissions('shipments.update')
  @ApiOperation({ summary: 'Mark shipment as delivered' })
  async markDelivered(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.service.markDelivered(id, user?.id);
    return { message: 'Shipment marked as delivered', data };
  }

  @Post(':id/mark-returned')
  @Permissions('shipments.update')
  @ApiOperation({ summary: 'Mark shipment as returned' })
  async markReturned(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.service.markReturned(id, user?.id);
    return { message: 'Shipment marked as returned', data };
  }

  @Post(':id/cancel')
  @Permissions('shipments.cancel')
  @ApiOperation({ summary: 'Cancel a shipment' })
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.service.cancel(id, user?.id);
    return { message: 'Shipment cancelled', data };
  }
}
