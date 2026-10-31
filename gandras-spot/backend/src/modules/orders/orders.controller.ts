import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrderStatus, UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AcceptOrderDto, RejectOrderDto, UpdateOrderStatusDto } from './dto/order-actions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthUser, Roles, RestaurantId } from '../../common/decorators/auth.decorators';
import { ConfigService } from '@nestjs/config';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private orders: OrdersService,
    private config: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create order (public)' })
  async create(@Body() dto: CreateOrderDto) {
    const slug = this.config.get('RESTAURANT_SLUG', 'gandras-spot');
    const data = await this.orders.createOrder(slug, dto);
    return { success: true, data };
  }

  @Get('track/:token')
  @ApiOperation({ summary: 'Track order by public token' })
  async track(@Param('token') token: string) {
    const data = await this.orders.trackByToken(token);
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN, UserRole.COURIER)
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiOperation({ summary: 'List orders' })
  async list(
    @RestaurantId() restaurantId: string,
    @Query('status') status?: OrderStatus,
  ) {
    const data = await this.orders.findAll(restaurantId, status);
    return { success: true, data };
  }

  @Get('new')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'New orders only' })
  async listNew(@RestaurantId() restaurantId: string) {
    const data = await this.orders.findNew(restaurantId);
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN, UserRole.COURIER)
  @ApiBearerAuth('access-token')
  async one(@RestaurantId() restaurantId: string, @Param('id') id: string) {
    const data = await this.orders.findOne(restaurantId, id);
    return { success: true, data };
  }

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async accept(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() dto: AcceptOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.orders.accept(restaurantId, id, dto, user.id);
    return { success: true, data };
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('access-token')
  async reject(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() dto: RejectOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.orders.reject(restaurantId, id, dto, user.id);
    return { success: true, data };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN, UserRole.COURIER)
  @ApiBearerAuth('access-token')
  async updateStatus(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.orders.updateStatus(restaurantId, id, dto, user.id);
    return { success: true, data };
  }
}
