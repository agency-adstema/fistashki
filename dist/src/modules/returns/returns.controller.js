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
exports.ReturnsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const returns_service_1 = require("./returns.service");
const create_return_dto_1 = require("./dto/create-return.dto");
const reject_return_dto_1 = require("./dto/reject-return.dto");
const returns_query_dto_1 = require("./dto/returns-query.dto");
let ReturnsController = class ReturnsController {
    returnsService;
    constructor(returnsService) {
        this.returnsService = returnsService;
    }
    async create(dto, req) {
        const data = await this.returnsService.create(dto, req.user?.userId);
        return { data };
    }
    async findAll(query) {
        const data = await this.returnsService.findAll(query);
        return { data };
    }
    async findOne(id) {
        const data = await this.returnsService.findOne(id);
        return { data };
    }
    async approve(id, req) {
        const data = await this.returnsService.approve(id, req.user?.userId);
        return { data };
    }
    async reject(id, dto, req) {
        const data = await this.returnsService.reject(id, dto, req.user?.userId);
        return { data };
    }
    async markReceived(id, req) {
        const data = await this.returnsService.markReceived(id, req.user?.userId);
        return { data };
    }
    async markRefundPending(id, req) {
        const data = await this.returnsService.markRefundPending(id, req.user?.userId);
        return { data };
    }
    async refund(id, req) {
        const data = await this.returnsService.refund(id, req.user?.userId);
        return { data };
    }
    async complete(id, req) {
        const data = await this.returnsService.complete(id, req.user?.userId);
        return { data };
    }
    async cancel(id, req) {
        const data = await this.returnsService.cancel(id, req.user?.userId);
        return { data };
    }
};
exports.ReturnsController = ReturnsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.Permissions)('returns.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a return request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_return_dto_1.CreateReturnDto, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('returns.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List return requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [returns_query_dto_1.ReturnsQueryDto]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('returns.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a return request by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('returns.approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a return request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('returns.reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a return request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_return_dto_1.RejectReturnDto, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/mark-received'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('returns.receive'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark return items as received (triggers stock reintegration)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "markReceived", null);
__decorate([
    (0, common_1.Post)(':id/mark-refund-pending'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('returns.refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark return as refund pending' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "markRefundPending", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('returns.refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Process refund for the return (based on return items total)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "refund", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('returns.complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete the return process' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('returns.cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a return request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "cancel", null);
exports.ReturnsController = ReturnsController = __decorate([
    (0, swagger_1.ApiTags)('Returns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('returns'),
    __metadata("design:paramtypes", [returns_service_1.ReturnsService])
], ReturnsController);
//# sourceMappingURL=returns.controller.js.map