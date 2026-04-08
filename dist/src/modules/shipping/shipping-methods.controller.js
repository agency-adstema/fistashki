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
exports.ShippingMethodsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipping_methods_service_1 = require("./shipping-methods.service");
const create_shipping_method_dto_1 = require("./dto/create-shipping-method.dto");
const update_shipping_method_dto_1 = require("./dto/update-shipping-method.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ShippingMethodsController = class ShippingMethodsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto, user) {
        const data = await this.service.create(dto, user?.id);
        return { message: 'Shipping method created successfully', data };
    }
    async findAll(isActive) {
        const data = await this.service.findAll(isActive);
        return { message: 'Shipping methods fetched successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'Shipping method fetched successfully', data };
    }
    async update(id, dto, user) {
        const data = await this.service.update(id, dto, user?.id);
        return { message: 'Shipping method updated successfully', data };
    }
    async remove(id, user) {
        const data = await this.service.remove(id, user?.id);
        return { message: 'Shipping method deleted successfully', data };
    }
};
exports.ShippingMethodsController = ShippingMethodsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('shipping_methods.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a shipping method' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shipping_method_dto_1.CreateShippingMethodDto, Object]),
    __metadata("design:returntype", Promise)
], ShippingMethodsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('shipping_methods.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List shipping methods' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('isActive', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], ShippingMethodsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('shipping_methods.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipping method by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShippingMethodsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('shipping_methods.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a shipping method' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shipping_method_dto_1.UpdateShippingMethodDto, Object]),
    __metadata("design:returntype", Promise)
], ShippingMethodsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('shipping_methods.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a shipping method' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShippingMethodsController.prototype, "remove", null);
exports.ShippingMethodsController = ShippingMethodsController = __decorate([
    (0, swagger_1.ApiTags)('shipping-methods'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('shipping-methods'),
    __metadata("design:paramtypes", [shipping_methods_service_1.ShippingMethodsService])
], ShippingMethodsController);
//# sourceMappingURL=shipping-methods.controller.js.map