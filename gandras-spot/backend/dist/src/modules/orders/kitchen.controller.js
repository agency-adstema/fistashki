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
exports.KitchenController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
let KitchenController = class KitchenController {
    constructor(orders) {
        this.orders = orders;
    }
    async active(restaurantId) {
        const data = await this.orders.kitchenOrders(restaurantId);
        return { success: true, data };
    }
    async delivery(restaurantId) {
        const data = await this.orders.deliveryOrders(restaurantId);
        return { success: true, data };
    }
};
exports.KitchenController = KitchenController;
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Active kitchen orders' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "active", null);
__decorate([
    (0, common_1.Get)('delivery'),
    (0, swagger_1.ApiOperation)({ summary: 'Ready orders for delivery dispatch' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "delivery", null);
exports.KitchenController = KitchenController = __decorate([
    (0, swagger_1.ApiTags)('kitchen'),
    (0, common_1.Controller)('kitchen'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.KITCHEN),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], KitchenController);
//# sourceMappingURL=kitchen.controller.js.map