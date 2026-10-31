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
exports.CourierController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const courier_service_1 = require("./courier.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
let CourierController = class CourierController {
    constructor(courier) {
        this.courier = courier;
    }
    me(restaurantId, user) {
        return this.courier.profile(restaurantId, user.id).then((data) => ({ success: true, data }));
    }
    dashboard(restaurantId, user) {
        return this.courier.dashboard(restaurantId, user.id).then((data) => ({ success: true, data }));
    }
    earnings(restaurantId, user) {
        return this.courier.earnings(restaurantId, user.id).then((data) => ({ success: true, data }));
    }
    claim(restaurantId, user, id) {
        return this.courier.claim(restaurantId, user.id, id).then((data) => ({ success: true, data }));
    }
    complete(restaurantId, user, id) {
        return this.courier.complete(restaurantId, user.id, id).then((data) => ({ success: true, data }));
    }
    status(restaurantId, user, status) {
        return this.courier.setStatus(restaurantId, user.id, status).then((data) => ({ success: true, data }));
    }
};
exports.CourierController = CourierController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Courier profile' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Queue, active deliveries and earnings' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('earnings'),
    (0, swagger_1.ApiOperation)({ summary: 'Earnings by period' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "earnings", null);
__decorate([
    (0, common_1.Patch)('orders/:id/claim'),
    (0, swagger_1.ApiOperation)({ summary: 'Take delivery from queue' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "claim", null);
__decorate([
    (0, common_1.Patch)('orders/:id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery completed' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Set online/offline status' }),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], CourierController.prototype, "status", null);
exports.CourierController = CourierController = __decorate([
    (0, swagger_1.ApiTags)('courier'),
    (0, common_1.Controller)('courier'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.COURIER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [courier_service_1.CourierService])
], CourierController);
//# sourceMappingURL=courier.controller.js.map