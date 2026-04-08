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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipments_service_1 = require("./shipments.service");
const create_shipment_dto_1 = require("./dto/create-shipment.dto");
const update_shipment_status_dto_1 = require("./dto/update-shipment-status.dto");
const update_tracking_dto_1 = require("./dto/update-tracking.dto");
const shipments_query_dto_1 = require("./dto/shipments-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ShipmentsController = class ShipmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto, user) {
        const data = await this.service.create(dto, user?.id);
        return { message: 'Shipment created successfully', data };
    }
    async findAll(query) {
        const data = await this.service.findAll(query);
        return { message: 'Shipments fetched successfully', data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { message: 'Shipment fetched successfully', data };
    }
    async updateStatus(id, dto, user) {
        const data = await this.service.updateStatus(id, dto, user?.id);
        return { message: 'Shipment status updated', data };
    }
    async updateTracking(id, dto, user) {
        const data = await this.service.updateTracking(id, dto, user?.id);
        return { message: 'Tracking information updated', data };
    }
    async markShipped(id, user) {
        const data = await this.service.markShipped(id, user?.id);
        return { message: 'Shipment marked as shipped', data };
    }
    async markDelivered(id, user) {
        const data = await this.service.markDelivered(id, user?.id);
        return { message: 'Shipment marked as delivered', data };
    }
    async markReturned(id, user) {
        const data = await this.service.markReturned(id, user?.id);
        return { message: 'Shipment marked as returned', data };
    }
    async cancel(id, user) {
        const data = await this.service.cancel(id, user?.id);
        return { message: 'Shipment cancelled', data };
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('shipments.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a shipment for an order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shipment_dto_1.CreateShipmentDto, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('shipments.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List shipments (paginated, filterable)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shipments_query_dto_1.ShipmentsQueryDto]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('shipments.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipment by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)('shipments.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipment status (validated transition)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shipment_status_dto_1.UpdateShipmentStatusDto, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/tracking'),
    (0, permissions_decorator_1.Permissions)('shipments.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach or update tracking information' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tracking_dto_1.UpdateTrackingDto, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "updateTracking", null);
__decorate([
    (0, common_1.Post)(':id/mark-shipped'),
    (0, permissions_decorator_1.Permissions)('shipments.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark shipment as shipped' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "markShipped", null);
__decorate([
    (0, common_1.Post)(':id/mark-delivered'),
    (0, permissions_decorator_1.Permissions)('shipments.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark shipment as delivered' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "markDelivered", null);
__decorate([
    (0, common_1.Post)(':id/mark-returned'),
    (0, permissions_decorator_1.Permissions)('shipments.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark shipment as returned' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "markReturned", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, permissions_decorator_1.Permissions)('shipments.cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a shipment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "cancel", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, swagger_1.ApiTags)('shipments'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('shipments'),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map