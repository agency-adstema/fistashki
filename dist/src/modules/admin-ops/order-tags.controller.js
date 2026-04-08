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
exports.OrderTagsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const tags_service_1 = require("./tags.service");
const create_tag_dto_1 = require("./dto/create-tag.dto");
const update_tag_dto_1 = require("./dto/update-tag.dto");
let OrderTagsController = class OrderTagsController {
    tagsService;
    constructor(tagsService) {
        this.tagsService = tagsService;
    }
    async create(dto, req) {
        const data = await this.tagsService.createTag(dto, req.user?.id);
        return { data };
    }
    async findAll() {
        const data = await this.tagsService.findAllTags();
        return { data };
    }
    async update(id, dto, req) {
        const data = await this.tagsService.updateTag(id, dto, req.user?.id);
        return { data };
    }
    async remove(id, req) {
        const data = await this.tagsService.deleteTag(id, req.user?.id);
        return { data };
    }
};
exports.OrderTagsController = OrderTagsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.Permissions)('order_tags.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a reusable order tag' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tag_dto_1.CreateTagDto, Object]),
    __metadata("design:returntype", Promise)
], OrderTagsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('order_tags.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List all order tags' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderTagsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('order_tags.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an order tag' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tag_dto_1.UpdateTagDto, Object]),
    __metadata("design:returntype", Promise)
], OrderTagsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('order_tags.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an order tag (removes all assignments)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderTagsController.prototype, "remove", null);
exports.OrderTagsController = OrderTagsController = __decorate([
    (0, swagger_1.ApiTags)('Order Tags'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('order-tags'),
    __metadata("design:paramtypes", [tags_service_1.TagsService])
], OrderTagsController);
//# sourceMappingURL=order-tags.controller.js.map