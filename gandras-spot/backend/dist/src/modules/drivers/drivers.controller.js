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
exports.DriversController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const drivers_service_1 = require("./drivers.service");
const create_courier_dto_1 = require("./dto/create-courier.dto");
const update_courier_dto_1 = require("./dto/update-courier.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
let DriversController = class DriversController {
    constructor(drivers) {
        this.drivers = drivers;
    }
    list(restaurantId) {
        return this.drivers.list(restaurantId).then((data) => ({ success: true, data }));
    }
    createCourier(restaurantId, body) {
        return this.drivers.createCourierAccount(restaurantId, body).then((data) => ({ success: true, data }));
    }
    create(restaurantId, body) {
        return this.drivers.create(restaurantId, body).then((data) => ({ success: true, data }));
    }
    update(restaurantId, id, body) {
        return this.drivers.update(restaurantId, id, body).then((data) => ({ success: true, data }));
    }
    status(restaurantId, id, status) {
        return this.drivers.setStatus(restaurantId, id, status).then((data) => ({ success: true, data }));
    }
    updateCourier(restaurantId, id, body) {
        return this.drivers.updateCourierAccount(restaurantId, id, body).then((data) => ({ success: true, data }));
    }
    remove(restaurantId, id) {
        return this.drivers.remove(restaurantId, id).then((data) => ({ success: true, data }));
    }
};
exports.DriversController = DriversController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('courier-account'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_courier_dto_1.CreateCourierDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "createCourier", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "status", null);
__decorate([
    (0, common_1.Patch)(':id/courier-account'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_courier_dto_1.UpdateCourierDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "updateCourier", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_decorators_1.RestaurantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "remove", null);
exports.DriversController = DriversController = __decorate([
    (0, swagger_1.ApiTags)('drivers'),
    (0, common_1.Controller)('admin/drivers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, auth_decorators_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [drivers_service_1.DriversService])
], DriversController);
//# sourceMappingURL=drivers.controller.js.map