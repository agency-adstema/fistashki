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
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const update_payment_status_dto_1 = require("./dto/update-payment-status.dto");
const update_fulfillment_status_dto_1 = require("./dto/update-fulfillment-status.dto");
const cancel_order_dto_1 = require("./dto/cancel-order.dto");
const orders_query_dto_1 = require("./dto/orders-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(dto, user) {
        const data = await this.ordersService.create(dto, user?.id);
        return { message: 'Order created successfully', data };
    }
    async findAll(query) {
        const data = await this.ordersService.findAll(query);
        return { message: 'Orders fetched successfully', data };
    }
    async findOne(id) {
        const data = await this.ordersService.findOne(id);
        return { message: 'Order fetched successfully', data };
    }
    async updateStatus(id, dto, user) {
        const data = await this.ordersService.updateStatus(id, dto, user?.id);
        return { message: 'Order status updated successfully', data };
    }
    async updatePaymentStatus(id, dto, user) {
        const data = await this.ordersService.updatePaymentStatus(id, dto, user?.id);
        return { message: 'Order payment status updated successfully', data };
    }
    async updateFulfillmentStatus(id, dto, user) {
        const data = await this.ordersService.updateFulfillmentStatus(id, dto, user?.id);
        return { message: 'Order fulfillment status updated successfully', data };
    }
    async cancelOrder(id, dto, user) {
        const data = await this.ordersService.cancelOrder(id, dto, user?.id);
        return { message: 'Order cancelled successfully', data };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('orders.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('orders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders (paginated, filterable)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orders_query_dto_1.OrdersQueryDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('orders.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by ID with all items' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)('orders.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_status_dto_1.UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment-status'),
    (0, permissions_decorator_1.Permissions)('orders.manage_payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order payment status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_status_dto_1.UpdatePaymentStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Patch)(':id/fulfillment-status'),
    (0, permissions_decorator_1.Permissions)('orders.manage_fulfillment'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order fulfillment status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_fulfillment_status_dto_1.UpdateFulfillmentStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateFulfillmentStatus", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, permissions_decorator_1.Permissions)('orders.cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an order and restore stock' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_order_dto_1.CancelOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map