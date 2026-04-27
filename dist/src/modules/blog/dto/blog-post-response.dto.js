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
exports.BlogPostListResponseDto = exports.BlogPostResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BlogPostResponseDto {
    id;
    title;
    slug;
    excerpt;
    content;
    featuredImage;
    category;
    author;
    readTime;
    seoTitle;
    seoDescription;
    seoKeywords;
    ogImage;
    ogTitle;
    ogDescription;
    published;
    publishedAt;
    createdAt;
    updatedAt;
}
exports.BlogPostResponseDto = BlogPostResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clx1a2b3c4d5e6f7g8h9' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Introduction to Organic Gardening' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'intro-organic-gardening' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Learn the basics of sustainable gardening without chemicals',
    }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '# Title\n\nContent here...' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://api.adstema.com/uploads/blog-image.jpg',
    }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "featuredImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gardening Tips' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], BlogPostResponseDto.prototype, "readTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Organic Gardening for Beginners - Tips & Guide' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "seoTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Learn how to start organic gardening without chemicals.',
    }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "seoDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'organic gardening, sustainable farming, gardening tips',
    }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "seoKeywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://api.adstema.com/uploads/og-image.jpg',
    }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "ogImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Organic Gardening Guide' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "ogTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Learn organic gardening basics' }),
    __metadata("design:type", String)
], BlogPostResponseDto.prototype, "ogDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BlogPostResponseDto.prototype, "published", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-04-27T12:00:00Z' }),
    __metadata("design:type", Date)
], BlogPostResponseDto.prototype, "publishedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-27T12:00:00Z' }),
    __metadata("design:type", Date)
], BlogPostResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-27T12:00:00Z' }),
    __metadata("design:type", Date)
], BlogPostResponseDto.prototype, "updatedAt", void 0);
class BlogPostListResponseDto {
    items;
    total;
    page;
    limit;
    pages;
}
exports.BlogPostListResponseDto = BlogPostListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BlogPostResponseDto] }),
    __metadata("design:type", Array)
], BlogPostListResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42 }),
    __metadata("design:type", Number)
], BlogPostListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], BlogPostListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], BlogPostListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], BlogPostListResponseDto.prototype, "pages", void 0);
//# sourceMappingURL=blog-post-response.dto.js.map