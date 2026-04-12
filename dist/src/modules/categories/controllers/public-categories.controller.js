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
exports.PublicCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("../categories.service");
const public_category_dto_1 = require("../dto/public-category.dto");
let PublicCategoriesController = class PublicCategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async findAll() {
        const data = await this.categoriesService.findPublicCategories();
        return data;
    }
    async findOne(id) {
        const data = await this.categoriesService.findPublicCategory(id);
        return data;
    }
};
exports.PublicCategoriesController = PublicCategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all public categories',
        description: 'Retrieve all available categories without authentication.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Categories fetched successfully',
        type: public_category_dto_1.PublicCategoriesListResponseDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get public category by ID',
        description: 'Retrieve a specific category with its details and subcategories.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Category fetched successfully',
        type: public_category_dto_1.PublicCategoryDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicCategoriesController.prototype, "findOne", null);
exports.PublicCategoriesController = PublicCategoriesController = __decorate([
    (0, swagger_1.ApiTags)('public-categories'),
    (0, common_1.Controller)('public/categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], PublicCategoriesController);
//# sourceMappingURL=public-categories.controller.js.map