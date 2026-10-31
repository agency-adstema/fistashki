import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true,
  },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    const trackToken = client.handshake.auth?.trackToken as string | undefined;

    if (trackToken) {
      client.join(`track:${trackToken}`);
      return;
    }

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwt.verify(token) as { sub: string; restaurantId: string };
      const membership = await this.prisma.restaurantUser.findFirst({
        where: { userId: payload.sub, restaurantId: payload.restaurantId },
      });
      if (!membership) {
        client.disconnect();
        return;
      }
      client.join(`restaurant:${payload.restaurantId}`);
      this.logger.debug(`Admin connected: ${payload.restaurantId}`);
    } catch {
      client.disconnect();
    }
  }

  emitNewOrder(restaurantId: string, order: unknown) {
    this.server.to(`restaurant:${restaurantId}`).emit('order:new', order);
  }

  emitOrderUpdate(restaurantId: string, order: unknown) {
    this.server.to(`restaurant:${restaurantId}`).emit('order:updated', order);
  }

  emitOrderUpdatePublic(trackToken: string, order: unknown) {
    this.server.to(`track:${trackToken}`).emit('order:updated', order);
  }
}
