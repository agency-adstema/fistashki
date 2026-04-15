import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNetworkOrderDto, ConfirmNetworkOrderDto, NetworkOrderResponseDto } from './dto/create-network-order.dto';
import axios from 'axios';

@Injectable()
export class NetworkOrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new order from network partner
   * Returns external order ID for partner to track
   */
  async createOrder(networkKey: string, dto: CreateNetworkOrderDto): Promise<NetworkOrderResponseDto> {
    // Verify network key is valid (would check against allowed networks)
    const networkName = await this.validateNetworkKey(networkKey);

    // Check if order already exists
    const existing = await this.prisma.networkOrder.findUnique({
      where: { externalId: dto.externalId },
    });

    if (existing) {
      throw new ConflictException(`Order ${dto.externalId} already exists in system`);
    }

    // Create network order record
    const networkOrder = await this.prisma.networkOrder.create({
      data: {
        networkKey,
        networkName,
        externalId: dto.externalId,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        customerName: dto.customerName,
        items: JSON.stringify(dto.items),
        totalAmount: dto.totalAmount,
        currency: dto.currency || 'RSD',
        notes: dto.notes,
        confirmationUrl: dto.confirmationUrl,
        webhookUrl: dto.webhookUrl,
        productsSku: dto.items.map((i) => i.sku),
        status: 'PENDING',
      },
    });

    return this.formatNetworkOrderResponse(networkOrder);
  }

  /**
   * Confirm order from CRM (call center confirmed with customer)
   * Sends webhook notification back to network partner
   */
  async confirmOrder(orderId: string, networkOrderId: string, dto: ConfirmNetworkOrderDto): Promise<NetworkOrderResponseDto> {
    const networkOrder = await this.prisma.networkOrder.findUnique({
      where: { id: networkOrderId },
      include: { order: true },
    });

    if (!networkOrder) {
      throw new NotFoundException(`Network order ${networkOrderId} not found`);
    }

    // Update status
    const updated = await this.prisma.networkOrder.update({
      where: { id: networkOrderId },
      data: {
        status: dto.status === 'CONFIRMED' ? 'CONFIRMED' : 'REJECTED',
        confirmedAt: new Date(),
      },
      include: { order: true },
    });

    // Send webhook to network if URL provided
    if (updated.webhookUrl) {
      await this.sendWebhookNotification(updated.webhookUrl, {
        externalId: updated.externalId,
        status: updated.status,
        orderNumber: updated.order?.orderNumber,
        timestamp: new Date().toISOString(),
        message: dto.message || `Order ${updated.status.toLowerCase()}`,
      });
    }

    return this.formatNetworkOrderResponse(updated);
  }

  /**
   * Get order by external ID
   */
  async getOrderByExternalId(externalId: string): Promise<NetworkOrderResponseDto> {
    const order = await this.prisma.networkOrder.findUnique({
      where: { externalId },
      include: { order: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${externalId} not found`);
    }

    return this.formatNetworkOrderResponse(order);
  }

  /**
   * List all network orders (for admin)
   */
  async listOrders(status?: string, networkKey?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (networkKey) where.networkKey = networkKey;

    return this.prisma.networkOrder.findMany({
      where,
      include: { order: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Validate network API key
   * In production, check against database of authorized networks
   */
  private async validateNetworkKey(key: string): Promise<string> {
    // TODO: Implement proper validation against database
    // For now, accept any key and extract network name
    if (!key || !key.startsWith('nk_')) {
      throw new BadRequestException('Invalid network API key format');
    }

    // Extract network name from key (e.g., nk_partner_name_xyz)
    const parts = key.split('_');
    if (parts.length < 3) {
      throw new BadRequestException('Invalid network API key format');
    }

    return parts[1]; // network name
  }

  /**
   * Send webhook notification to network partner
   */
  private async sendWebhookNotification(webhookUrl: string, payload: any): Promise<void> {
    try {
      await axios.post(webhookUrl, payload, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-Adstema-Signature': this.generateSignature(payload),
        },
      });
    } catch (error) {
      // Log but don't fail - order is already confirmed
      console.error(`[NetworkOrders] Webhook failed for ${webhookUrl}:`, error.message);
    }
  }

  /**
   * Generate HMAC signature for webhook security
   */
  private generateSignature(payload: any): string {
    // TODO: Implement proper HMAC-SHA256 signing with shared secret
    const crypto = require('crypto');
    const secret = process.env.NETWORK_WEBHOOK_SECRET || 'dev-secret';
    return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  }

  private formatNetworkOrderResponse(order: any): NetworkOrderResponseDto {
    return {
      id: order.id,
      externalId: order.externalId,
      status: order.status,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      order: order.order
        ? {
            id: order.order.id,
            orderNumber: order.order.orderNumber,
            status: order.order.status,
          }
        : undefined,
    };
  }
}
