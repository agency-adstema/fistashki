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
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calls_service_1 = require("./calls.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CallsController = class CallsController {
    callsService;
    constructor(callsService) {
        this.callsService = callsService;
    }
    async getAllCalls(page = '1', limit = '50') {
        const data = await this.callsService.getAllCalls(parseInt(page, 10), parseInt(limit, 10));
        return { message: 'Calls fetched successfully', data };
    }
    async getStats() {
        const data = await this.callsService.getCallStats();
        return { message: 'Stats fetched successfully', data };
    }
    async getCall(id) {
        const data = await this.callsService.getCallLog(id);
        if (!data) {
            return { message: 'Call not found', data: null };
        }
        return { message: 'Call fetched successfully', data };
    }
    async retryCall(id, user) {
        const data = await this.callsService.retryCall(id, user?.id);
        return { message: 'Call retry scheduled', data };
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('calls.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all calls (paginated)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getAllCalls", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.Permissions)('calls.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get call statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('calls.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get call by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getCall", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, permissions_decorator_1.Permissions)('calls.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed call' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "retryCall", null);
exports.CallsController = CallsController = __decorate([
    (0, swagger_1.ApiTags)('calls'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('calls'),
    __metadata("design:paramtypes", [calls_service_1.CallsService])
], CallsController);
//# sourceMappingURL=calls.controller.js.map