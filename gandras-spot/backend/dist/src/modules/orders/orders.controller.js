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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const order_actions_dto_1 = require("./dto/order-actions.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const config_1 = require("@nestjs/config");
let OrdersController = class OrdersController {
    constructor(orders, config) {
        this.orders = orders;
        this.config = config;
    }
    async create(dto) {
        const slug = this.config.get('RESTAURANT_SLUG', 'gandras-spot');
        const data = await this.orders.createOrder(slug, dto);
        return { success: true, data };
    }
    async track(token) {
        const data = await this.orders.trackByToken(token);
        return { success: true, data };
    }
    async list(restaurantId, status) {
        const data = await this.orders.findAll(restaurantId, status);
        return { success: true, data };
    }
    async listNew(restaurantId) {
        const data = await this.orders.findNew(restaurantId);
        return { success: true, data };
    }
    async one(restaurantId, id) {
        const data = await this.orders.findOne(restaurantId, id);
        return { success: true, data };
    }
    async accept(restaurantId, id, dto, user) {
        const data = await this.orders.accept(restaurantId, id, dto, user.id);
        return { success: true, data };
    }
    async reject(restaurantId, id, dto, user) {
        const data = await this.orders.reject(restaurantId, id, dto, user.id);
        return { success: true, data };
    }
    async updateStatus(restaurantId, id, dto, user) {
        const data = await this.orders.updateStatus(restaurantId, id, dto, user.id);
        return { success: true, data };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create order (public)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('track/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Track order by public token' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "track", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.KITCHEN, client_1.UserRole.COURIER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.OrderStatus }),
    (0, swagger_1.ApiOperation)({ summary: 'List orders' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('new'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'New orders only' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "listNew", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.KITCHEN, client_1.UserRole.COURIER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "one", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, order_actions_dto_1.AcceptOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, order_actions_dto_1.RejectOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.KITCHEN, client_1.UserRole.COURIER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, order_actions_dto_1.UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        config_1.ConfigService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map