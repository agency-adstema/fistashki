import { Controller, Post, Get, Patch, Body, Param, UseGuards, BadRequestException, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { NetworkOrdersService } from './network-orders.service';
import { CreateNetworkOrderDto, ConfirmNetworkOrderDto, NetworkOrderResponseDto } from './dto/create-network-order.dto';

@ApiTags('network-orders')
@Controller('api/v1/network-orders')
export class NetworkOrdersController {
  constructor(private readonly service: NetworkOrdersService) {}

  /**
   * CREATE NEW ORDER FROM NETWORK PARTNER
   * Network partners send orders here (creams, teas, etc. from their landing pages)
   * No authentication required - uses API key in header
   */
  @Post('create')
  @ApiOperation({
    summary: 'Create new order from network partner',
    description: 'Partners submit orders from their landing pages. Order arrives as PENDING in CRM.',
  })
  @ApiHeader({
    name: 'X-Network-Key',
    description: 'Network API key (nk_partner_name_...)',
    example: 'nk_creams_partner_xyz123',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: NetworkOrderResponseDto,
  })
  async createOrder(
    @Headers('X-Network-Key') networkKey: string,
    @Body() dto: CreateNetworkOrderDto,
  ): Promise<{ success: boolean; data: NetworkOrderResponseDto; message: string }> {
    if (!networkKey) {
      throw new BadRequestException('X-Network-Key header required');
    }

    const order = await this.service.createOrder(networkKey, dto);
    return {
      success: true,
      data: order,
      message: `Order received. ID: ${order.externalId}. Status: PENDING. Waiting for CRM confirmation.`,
    };
  }

  /**
   * GET ORDER STATUS
   * Network partner checks order status using external ID
   */
  @Get(':externalId')
  @ApiOperation({
    summary: 'Get order status by external ID',
    description: 'Check if order was confirmed or rejected by CRM',
  })
  @ApiHeader({
    name: 'X-Network-Key',
    description: 'Network API key',
    example: 'nk_creams_partner_xyz123',
  })
  async getOrder(
    @Param('externalId') externalId: string,
    @Headers('X-Network-Key') networkKey: string,
  ): Promise<{ success: boolean; data: NetworkOrderResponseDto }> {
    if (!networkKey) {
      throw new BadRequestException('X-Network-Key header required');
    }

    const order = await this.service.getOrderByExternalId(externalId);
    return { success: true, data: order };
  }

  /**
   * CONFIRM/REJECT ORDER (ADMIN ONLY)
   * Call center confirms the order after calling customer
   * Sends webhook back to network partner
   */
  @Patch(':networkOrderId/confirm')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm or reject order (admin only)',
    description:
      'After call center confirms with customer, update order status. Sends webhook to partner with result.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order confirmation status updated and webhook sent',
    type: NetworkOrderResponseDto,
  })
  async confirmOrder(
    @Param('networkOrderId') networkOrderId: string,
    @Body() dto: ConfirmNetworkOrderDto,
  ): Promise<{ success: boolean; data: NetworkOrderResponseDto; message: string }> {
    // In production, add @UseGuards(JwtAuthGuard, PermissionsGuard) with 'orders.update' permission

    // Find the regular order linked to this network order
    const updated = await this.service.confirmOrder('', networkOrderId, dto);

    return {
      success: true,
      data: updated,
      message: `Order ${updated.status.toLowerCase()}. Webhook notification sent to partner.`,
    };
  }

  /**
   * LIST NETWORK ORDERS (ADMIN)
   * View all network partner orders in CRM
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all network orders (admin)',
    description: 'View orders from all network partners, filter by status',
  })
  async listOrders(@Body() query: { status?: string; networkKey?: string }) {
    // In production, add @UseGuards(JwtAuthGuard, PermissionsGuard)
    const orders = await this.service.listOrders(query.status, query.networkKey);
    return { success: true, data: orders, count: orders.length };
  }
}
