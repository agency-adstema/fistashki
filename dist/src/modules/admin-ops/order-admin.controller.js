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
exports.OrderAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const tags_service_1 = require("./tags.service");
const admin_ops_service_1 = require("./admin-ops.service");
const assign_order_dto_1 = require("./dto/assign-order.dto");
const set_priority_dto_1 = require("./dto/set-priority.dto");
const timeline_query_dto_1 = require("./dto/timeline-query.dto");
let OrderAdminController = class OrderAdminController {
    adminOpsService;
    tagsService;
    constructor(adminOpsService, tagsService) {
        this.adminOpsService = adminOpsService;
        this.tagsService = tagsService;
    }
    async getOrderTags(id) {
        const data = await this.tagsService.getOrderTags(id);
        return { data };
    }
    async assignTag(id, tagId, req) {
        const data = await this.tagsService.assignTag(id, tagId, req.user?.id);
        return { data };
    }
    async removeTag(id, tagId, req) {
        const data = await this.tagsService.removeTag(id, tagId, req.user?.id);
        return { data };
    }
    async assign(id, dto, req) {
        const data = await this.adminOpsService.assignOrder(id, dto, req.user?.id);
        return { data };
    }
    async unassign(id, req) {
        const data = await this.adminOpsService.unassignOrder(id, req.user?.id);
        return { data };
    }
    async setPriority(id, dto, req) {
        const data = await this.adminOpsService.setPriority(id, dto, req.user?.id);
        return { data };
    }
    async getTimeline(id, query) {
        const data = await this.adminOpsService.getTimeline(id, query);
        return { data };
    }
};
exports.OrderAdminController = OrderAdminController;
__decorate([
    (0, common_1.Get)(':id/tags'),
    (0, permissions_decorator_1.Permissions)('order_tags.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tags assigned to an order' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderAdminController.prototype, "getOrderTags", null);
__decorate([
    (0, common_1.Post)(':id/tags/:tagId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.Permissions)('order_tags.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a tag to an order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('tagId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderAdminController.prototype, "assignTag", null);
__decorate([
    (0, common_1.Delete)(':id/tags/:tagId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('order_tags.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a tag from an order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('tagId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderAdminController.prototype, "removeTag", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('orders.assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign an order to an admin user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_order_dto_1.AssignOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderAdminController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/unassign'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('orders.assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove assignee from an order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderAdminController.prototype, "unassign", null);
__decorate([
    (0, common_1.Patch)(':id/priority'),
    (0, permissions_decorator_1.Permissions)('orders.set_priority'),
    (0, swagger_1.ApiOperation)({ summary: 'Set order priority' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_priority_dto_1.SetPriorityDto, Object]),
    __metadata("design:returntype", Promise)
], OrderAdminController.prototype, "setPriority", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, permissions_decorator_1.Permissions)('orders.timeline.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unified timeline for an order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, timeline_query_dto_1.TimelineQueryDto]),
    __metadata("design:returntype", Promise)
], OrderAdminController.prototype, "getTimeline", null);
exports.OrderAdminController = OrderAdminController = __decorate([
    (0, swagger_1.ApiTags)('Order Admin Operations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [admin_ops_service_1.AdminOpsService,
        tags_service_1.TagsService])
], OrderAdminController);
//# sourceMappingURL=order-admin.controller.js.map