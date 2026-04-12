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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicProductsListResponseDto = exports.PublicProductDetailDto = exports.PublicProductDto = exports.PublicProductCategoryDto = exports.PublicProductImageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PublicProductImageDto {
    url;
    altText;
}
exports.PublicProductImageDto = PublicProductImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/image.jpg' }),
    __metadata("design:type", String)
], PublicProductImageDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Product front view' }),
    __metadata("design:type", String)
], PublicProductImageDto.prototype, "altText", void 0);
class PublicProductCategoryDto {
    id;
    name;
}
exports.PublicProductCategoryDto = PublicProductCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clc123456789abcdefghijklmn' }),
    __metadata("design:type", String)
], PublicProductCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Electronics' }),
    __metadata("design:type", String)
], PublicProductCategoryDto.prototype, "name", void 0);
class PublicProductDto {
    id;
    name;
    description;
    price;
    currency;
    images;
    inStock;
    availableQuantity;
    category;
    featuredImage;
}
exports.PublicProductDto = PublicProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clc123456789abcdefghijklmn' }),
    __metadata("design:type", String)
], PublicProductDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Wireless Headphones' }),
    __metadata("design:type", String)
], PublicProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Premium noise-cancelling headphones' }),
    __metadata("design:type", String)
], PublicProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 299.99 }),
    __metadata("design:type", Number)
], PublicProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    __metadata("design:type", String)
], PublicProductDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [PublicProductImageDto] }),
    __metadata("design:type", Array)
], PublicProductDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PublicProductDto.prototype, "inStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'Available quantity if tracked' }),
    __metadata("design:type", Number)
], PublicProductDto.prototype, "availableQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: PublicProductCategoryDto }),
    __metadata("design:type", PublicProductCategoryDto)
], PublicProductDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/featured.jpg' }),
    __metadata("design:type", String)
], PublicProductDto.prototype, "featuredImage", void 0);
class PublicProductDetailDto extends PublicProductDto {
    sku;
    shortDescription;
    compareAtPrice;
    seoTitle;
    seoDescription;
    categories;
    createdAt;
    updatedAt;
}
exports.PublicProductDetailDto = PublicProductDetailDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'WH-1000XM5' }),
    __metadata("design:type", String)
], PublicProductDetailDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Premium noise-cancelling headphones' }),
    __metadata("design:type", String)
], PublicProductDetailDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 349.99 }),
    __metadata("design:type", Number)
], PublicProductDetailDto.prototype, "compareAtPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Wireless Headphones | My Store' }),
    __metadata("design:type", String)
], PublicProductDetailDto.prototype, "seoTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Buy the best wireless headphones online.' }),
    __metadata("design:type", String)
], PublicProductDetailDto.prototype, "seoDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [PublicProductCategoryDto] }),
    __metadata("design:type", Array)
], PublicProductDetailDto.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PublicProductDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PublicProductDetailDto.prototype, "updatedAt", void 0);
class PublicProductsListResponseDto {
    items;
    total;
    page;
    limit;
    pages;
}
exports.PublicProductsListResponseDto = PublicProductsListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PublicProductDto] }),
    __metadata("design:type", Array)
], PublicProductsListResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    __metadata("design:type", Number)
], PublicProductsListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], PublicProductsListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    __metadata("design:type", Number)
], PublicProductsListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], PublicProductsListResponseDto.prototype, "pages", void 0);
//# sourceMappingURL=public-product.dto.js.map