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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateFulfillmentStatusDto } from './dto/update-fulfillment-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions('orders.create')
  @ApiOperation({ summary: 'Create a new order' })
  async create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    const data = await this.ordersService.create(dto, user?.id);
    return { message: 'Order created successfully', data };
  }

  @Get()
  @Permissions('orders.read')
  @ApiOperation({ summary: 'Get all orders (paginated, filterable)' })
  async findAll(@Query() query: OrdersQueryDto) {
    const data = await this.ordersService.findAll(query);
    return { message: 'Orders fetched successfully', data };
  }

  @Get(':id')
  @Permissions('orders.read')
  @ApiOperation({ summary: 'Get order by ID with all items' })
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return { message: 'Order fetched successfully', data };
  }

  @Patch(':id/status')
  @Permissions('orders.update')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.ordersService.updateStatus(id, dto, user?.id);
    return { message: 'Order status updated successfully', data };
  }

  @Patch(':id/payment-status')
  @Permissions('orders.manage_payment')
  @ApiOperation({ summary: 'Update order payment status' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.ordersService.updatePaymentStatus(id, dto, user?.id);
    return { message: 'Order payment status updated successfully', data };
  }

  @Patch(':id/fulfillment-status')
  @Permissions('orders.manage_fulfillment')
  @ApiOperation({ summary: 'Update order fulfillment status' })
  async updateFulfillmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFulfillmentStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.ordersService.updateFulfillmentStatus(id, dto, user?.id);
    return { message: 'Order fulfillment status updated successfully', data };
  }

  @Post(':id/cancel')
  @Permissions('orders.cancel')
  @ApiOperation({ summary: 'Cancel an order and restore stock' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.ordersService.cancelOrder(id, dto, user?.id);
    return { message: 'Order cancelled successfully', data };
  }
}
