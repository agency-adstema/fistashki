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
exports.PublicProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("../products.service");
const public_product_dto_1 = require("../dto/public-product.dto");
class PublicProductsQueryDto {
    page = 1;
    limit = 20;
    search;
    category;
}
let PublicProductsController = class PublicProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(page, limit, search, category) {
        const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
        const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
        const data = await this.productsService.findPublicProducts({
            page: pageNum,
            limit: limitNum,
            search,
            categoryId: category,
        });
        return data;
    }
    async findOne(id) {
        const data = await this.productsService.findPublicProduct(id);
        return data;
    }
};
exports.PublicProductsController = PublicProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all public products (paginated, searchable, filterable)',
        description: 'Browse products without authentication. Supports pagination, search, and category filtering.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        example: 1,
        description: 'Page number',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        example: 20,
        description: 'Items per page (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: 'Search by product name or SKU',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'category',
        required: false,
        description: 'Filter by category ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Products fetched successfully',
        type: public_product_dto_1.PublicProductsListResponseDto,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get public product by ID',
        description: 'Retrieve detailed product information including all images and full details.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product fetched successfully',
        type: public_product_dto_1.PublicProductDetailDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "findOne", null);
exports.PublicProductsController = PublicProductsController = __decorate([
    (0, swagger_1.ApiTags)('public-products'),
    (0, common_1.Controller)('public/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], PublicProductsController);
//# sourceMappingURL=public-products.controller.js.map