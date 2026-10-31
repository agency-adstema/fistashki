import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class OrdersGateway implements OnGatewayConnection {
    private jwt;
    private prisma;
    server: Server;
    private readonly logger;
    constructor(jwt: JwtService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    emitNewOrder(restaurantId: string, order: unknown): void;
    emitOrderUpdate(restaurantId: string, order: unknown): void;
    emitOrderUpdatePublic(trackToken: string, order: unknown): void;
}
