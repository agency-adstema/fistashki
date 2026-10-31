"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let OrdersGateway = OrdersGateway_1 = class OrdersGateway {
    constructor(jwt, prisma) {
        this.jwt = jwt;
        this.prisma = prisma;
        this.logger = new common_1.Logger(OrdersGateway_1.name);
    }
    async handleConnection(client) {
        const token = client.handshake.auth?.token;
        const trackToken = client.handshake.auth?.trackToken;
        if (trackToken) {
            client.join(`track:${trackToken}`);
            return;
        }
        if (!token) {
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwt.verify(token);
            const membership = await this.prisma.restaurantUser.findFirst({
                where: { userId: payload.sub, restaurantId: payload.restaurantId },
            });
            if (!membership) {
                client.disconnect();
                return;
            }
            client.join(`restaurant:${payload.restaurantId}`);
            this.logger.debug(`Admin connected: ${payload.restaurantId}`);
        }
        catch {
            client.disconnect();
        }
    }
    emitNewOrder(restaurantId, order) {
        this.server.to(`restaurant:${restaurantId}`).emit('order:new', order);
    }
    emitOrderUpdate(restaurantId, order) {
        this.server.to(`restaurant:${restaurantId}`).emit('order:updated', order);
    }
    emitOrderUpdatePublic(trackToken, order) {
        this.server.to(`track:${trackToken}`).emit('order:updated', order);
    }
};
exports.OrdersGateway = OrdersGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OrdersGateway.prototype, "server", void 0);
exports.OrdersGateway = OrdersGateway = OrdersGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
            credentials: true,
        },
        namespace: '/orders',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], OrdersGateway);
//# sourceMappingURL=orders.gateway.js.map