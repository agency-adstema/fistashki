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
exports.PublicCategoriesListResponseDto = exports.PublicCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PublicCategoryDto {
    id;
    name;
    description;
    parentId;
    sortOrder;
    children;
    productCount;
}
exports.PublicCategoryDto = PublicCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clc123456789abcdefghijklmn' }),
    __metadata("design:type", String)
], PublicCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Electronics' }),
    __metadata("design:type", String)
], PublicCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'All electronic items' }),
    __metadata("design:type", String)
], PublicCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'clc0987654321abcdefghijklmn' }),
    __metadata("design:type", String)
], PublicCategoryDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    __metadata("design:type", Number)
], PublicCategoryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [PublicCategoryDto] }),
    __metadata("design:type", Array)
], PublicCategoryDto.prototype, "children", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Number of products in this category' }),
    __metadata("design:type", Number)
], PublicCategoryDto.prototype, "productCount", void 0);
class PublicCategoriesListResponseDto {
    items;
}
exports.PublicCategoriesListResponseDto = PublicCategoriesListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PublicCategoryDto] }),
    __metadata("design:type", Array)
], PublicCategoriesListResponseDto.prototype, "items", void 0);
//# sourceMappingURL=public-category.dto.js.map