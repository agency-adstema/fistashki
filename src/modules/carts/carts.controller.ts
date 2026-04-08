import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AssignCustomerDto } from './dto/assign-customer.dto';
import { AssignShippingMethodDto } from './dto/assign-shipping-method.dto';
import { AssignPaymentMethodDto } from './dto/assign-payment-method.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CartsQueryDto } from './dto/carts-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // ── Admin listing (auth required) ─────────────────────────────────────────

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('carts.read')
  @ApiOperation({ summary: 'Admin: list all carts (paginated, filterable)' })
  async findAll(@Query() query: CartsQueryDto) {
    const data = await this.cartsService.findAll(query);
    return { message: 'Carts fetched successfully', data };
  }

  // ── Public cart routes ────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new cart (public)' })
  async create(@Body() dto: CreateCartDto) {
    const data = await this.cartsService.create(dto);
    return { message: 'Cart created successfully', data };
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get active cart by session ID (public)' })
  async findBySession(@Param('sessionId') sessionId: string) {
    const data = await this.cartsService.findBySessionId(sessionId);
    return { message: 'Cart fetched successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart by ID (public)' })
  async findOne(@Param('id') id: string) {
    const data = await this.cartsService.findById(id);
    return { message: 'Cart fetched successfully', data };
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to cart (public)' })
  async addItem(@Param('id') id: string, @Body() dto: AddCartItemDto) {
    const data = await this.cartsService.addItem(id, dto);
    return { message: 'Item added to cart', data };
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity (public); send 0 to remove' })
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cartsService.updateItem(id, itemId, dto);
    return { message: 'Cart item updated', data };
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remove specific item from cart (public)' })
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    const data = await this.cartsService.removeItem(id, itemId);
    return { message: 'Cart item removed', data };
  }

  @Delete(':id/items')
  @ApiOperation({ summary: 'Clear all items from cart (public)' })
  async clearItems(@Param('id') id: string) {
    const data = await this.cartsService.clearItems(id);
    return { message: 'Cart cleared', data };
  }

  @Patch(':id/assign-customer')
  @ApiOperation({ summary: 'Assign customer to cart (public)' })
  async assignCustomer(@Param('id') id: string, @Body() dto: AssignCustomerDto) {
    const data = await this.cartsService.assignCustomer(id, dto);
    return { message: 'Customer assigned to cart', data };
  }

  @Patch(':id/shipping-method')
  @ApiOperation({ summary: 'Set shipping method on cart (public)' })
  async assignShippingMethod(@Param('id') id: string, @Body() dto: AssignShippingMethodDto) {
    const data = await this.cartsService.assignShippingMethod(id, dto);
    return { message: 'Shipping method assigned', data };
  }

  @Patch(':id/payment-method')
  @ApiOperation({ summary: 'Set payment method on cart (public)' })
  async assignPaymentMethod(@Param('id') id: string, @Body() dto: AssignPaymentMethodDto) {
    const data = await this.cartsService.assignPaymentMethod(id, dto);
    return { message: 'Payment method assigned', data };
  }

  @Post(':id/checkout')
  @ApiOperation({ summary: 'Checkout cart into order (public; supports guest and existing customer)' })
  async checkout(@Param('id') id: string, @Body() dto: CheckoutDto) {
    const data = await this.cartsService.checkout(id, dto);
    return { message: 'Checkout successful', data };
  }
}
