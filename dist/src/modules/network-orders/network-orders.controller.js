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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const network_orders_service_1 = require("./network-orders.service");
const create_network_order_dto_1 = require("./dto/create-network-order.dto");
let NetworkOrdersController = class NetworkOrdersController {
    service;
    constructor(service) {
        this.service = service;
    }
    async createOrder(networkKey, dto) {
        if (!networkKey) {
            throw new common_1.BadRequestException('X-Network-Key header required');
        }
        const order = await this.service.createOrder(networkKey, dto);
        return {
            success: true,
            data: order,
            message: `Order received. ID: ${order.externalId}. Status: PENDING. Waiting for CRM confirmation.`,
        };
    }
    async getOrder(externalId, networkKey) {
        if (!networkKey) {
            throw new common_1.BadRequestException('X-Network-Key header required');
        }
        const order = await this.service.getOrderByExternalId(externalId);
        return { success: true, data: order };
    }
    async confirmOrder(networkOrderId, dto) {
        const updated = await this.service.confirmOrder('', networkOrderId, dto);
        return {
            success: true,
            data: updated,
            message: `Order ${updated.status.toLowerCase()}. Webhook notification sent to partner.`,
        };
    }
    async listOrders(query) {
        const orders = await this.service.listOrders(query.status, query.networkKey);
        return { success: true, data: orders, count: orders.length };
    }
};
exports.NetworkOrdersController = NetworkOrdersController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new order from network partner',
        description: 'Partners submit orders from their landing pages. Order arrives as PENDING in CRM.',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Network-Key',
        description: 'Network API key (nk_partner_name_...)',
        example: 'nk_creams_partner_xyz123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Order created successfully',
        type: create_network_order_dto_1.NetworkOrderResponseDto,
    }),
    __param(0, (0, common_1.Headers)('X-Network-Key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_network_order_dto_1.CreateNetworkOrderDto]),
    __metadata("design:returntype", Promise)
], NetworkOrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)(':externalId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get order status by external ID',
        description: 'Check if order was confirmed or rejected by CRM',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'X-Network-Key',
        description: 'Network API key',
        example: 'nk_creams_partner_xyz123',
    }),
    __param(0, (0, common_1.Param)('externalId')),
    __param(1, (0, common_1.Headers)('X-Network-Key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NetworkOrdersController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Patch)(':networkOrderId/confirm'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm or reject order (admin only)',
        description: 'After call center confirms with customer, update order status. Sends webhook to partner with result.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Order confirmation status updated and webhook sent',
        type: create_network_order_dto_1.NetworkOrderResponseDto,
    }),
    __param(0, (0, common_1.Param)('networkOrderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_network_order_dto_1.ConfirmNetworkOrderDto]),
    __metadata("design:returntype", Promise)
], NetworkOrdersController.prototype, "confirmOrder", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List all network orders (admin)',
        description: 'View orders from all network partners, filter by status',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NetworkOrdersController.prototype, "listOrders", null);
exports.NetworkOrdersController = NetworkOrdersController = __decorate([
    (0, swagger_1.ApiTags)('network-orders'),
    (0, common_1.Controller)('api/v1/network-orders'),
    __metadata("design:paramtypes", [network_orders_service_1.NetworkOrdersService])
], NetworkOrdersController);
//# sourceMappingURL=network-orders.controller.js.map