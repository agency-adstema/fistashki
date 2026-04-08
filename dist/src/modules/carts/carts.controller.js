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
exports.CartsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const carts_service_1 = require("./carts.service");
const create_cart_dto_1 = require("./dto/create-cart.dto");
const add_cart_item_dto_1 = require("./dto/add-cart-item.dto");
const update_cart_item_dto_1 = require("./dto/update-cart-item.dto");
const assign_customer_dto_1 = require("./dto/assign-customer.dto");
const assign_shipping_method_dto_1 = require("./dto/assign-shipping-method.dto");
const assign_payment_method_dto_1 = require("./dto/assign-payment-method.dto");
const checkout_dto_1 = require("./dto/checkout.dto");
const carts_query_dto_1 = require("./dto/carts-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let CartsController = class CartsController {
    cartsService;
    constructor(cartsService) {
        this.cartsService = cartsService;
    }
    async findAll(query) {
        const data = await this.cartsService.findAll(query);
        return { message: 'Carts fetched successfully', data };
    }
    async create(dto) {
        const data = await this.cartsService.create(dto);
        return { message: 'Cart created successfully', data };
    }
    async findBySession(sessionId) {
        const data = await this.cartsService.findBySessionId(sessionId);
        return { message: 'Cart fetched successfully', data };
    }
    async findOne(id) {
        const data = await this.cartsService.findById(id);
        return { message: 'Cart fetched successfully', data };
    }
    async addItem(id, dto) {
        const data = await this.cartsService.addItem(id, dto);
        return { message: 'Item added to cart', data };
    }
    async updateItem(id, itemId, dto) {
        const data = await this.cartsService.updateItem(id, itemId, dto);
        return { message: 'Cart item updated', data };
    }
    async removeItem(id, itemId) {
        const data = await this.cartsService.removeItem(id, itemId);
        return { message: 'Cart item removed', data };
    }
    async clearItems(id) {
        const data = await this.cartsService.clearItems(id);
        return { message: 'Cart cleared', data };
    }
    async assignCustomer(id, dto) {
        const data = await this.cartsService.assignCustomer(id, dto);
        return { message: 'Customer assigned to cart', data };
    }
    async assignShippingMethod(id, dto) {
        const data = await this.cartsService.assignShippingMethod(id, dto);
        return { message: 'Shipping method assigned', data };
    }
    async assignPaymentMethod(id, dto) {
        const data = await this.cartsService.assignPaymentMethod(id, dto);
        return { message: 'Payment method assigned', data };
    }
    async checkout(id, dto) {
        const data = await this.cartsService.checkout(id, dto);
        return { message: 'Checkout successful', data };
    }
};
exports.CartsController = CartsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('carts.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: list all carts (paginated, filterable)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [carts_query_dto_1.CartsQueryDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new cart (public)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cart_dto_1.CreateCartDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active cart by session ID (public)' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "findBySession", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cart by ID (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item to cart (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_cart_item_dto_1.AddCartItemDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)(':id/items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update cart item quantity (public); send 0 to remove' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_cart_item_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove specific item from cart (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Delete)(':id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all items from cart (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "clearItems", null);
__decorate([
    (0, common_1.Patch)(':id/assign-customer'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign customer to cart (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_customer_dto_1.AssignCustomerDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "assignCustomer", null);
__decorate([
    (0, common_1.Patch)(':id/shipping-method'),
    (0, swagger_1.ApiOperation)({ summary: 'Set shipping method on cart (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_shipping_method_dto_1.AssignShippingMethodDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "assignShippingMethod", null);
__decorate([
    (0, common_1.Patch)(':id/payment-method'),
    (0, swagger_1.ApiOperation)({ summary: 'Set payment method on cart (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_payment_method_dto_1.AssignPaymentMethodDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "assignPaymentMethod", null);
__decorate([
    (0, common_1.Post)(':id/checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Checkout cart into order (public; supports guest and existing customer)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, checkout_dto_1.CheckoutDto]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "checkout", null);
exports.CartsController = CartsController = __decorate([
    (0, swagger_1.ApiTags)('carts'),
    (0, common_1.Controller)('carts'),
    __metadata("design:paramtypes", [carts_service_1.CartsService])
], CartsController);
//# sourceMappingURL=carts.controller.js.map