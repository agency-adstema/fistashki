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
exports.GenerateCommerceSeoDto = exports.CommerceSeoProductInputDto = exports.CommerceContentType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var CommerceContentType;
(function (CommerceContentType) {
    CommerceContentType["CATEGORY_MONEY_PAGE"] = "CATEGORY_MONEY_PAGE";
    CommerceContentType["PRODUCT"] = "PRODUCT";
    CommerceContentType["BLOG"] = "BLOG";
    CommerceContentType["FAQ_ONLY"] = "FAQ_ONLY";
    CommerceContentType["META_ONLY"] = "META_ONLY";
})(CommerceContentType || (exports.CommerceContentType = CommerceContentType = {}));
class CommerceSeoProductInputDto {
    name;
    benefits;
    priceDisplay;
    slug;
}
exports.CommerceSeoProductInputDto = CommerceSeoProductInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Peloid HUMUS' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CommerceSeoProductInputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Short benefit bullets or one line' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CommerceSeoProductInputDto.prototype, "benefits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1.290 RSD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CommerceSeoProductInputDto.prototype, "priceDisplay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CommerceSeoProductInputDto.prototype, "slug", void 0);
class GenerateCommerceSeoDto {
    contentType;
    mainKeyword;
    relatedKeywords;
    buyerIntentKeywords;
    targetCategory;
    categoryId;
    products;
    internalLinks;
    toneOfVoice;
    language;
    country;
    wordCountTarget;
    ctaTarget;
    brandNotes;
    contextSummary;
    primaryProductName;
}
exports.GenerateCommerceSeoDto = GenerateCommerceSeoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CommerceContentType }),
    (0, class_validator_1.IsEnum)(CommerceContentType),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'tečno organsko đubrivo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "mainKeyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['organsko đubrivo za biljke', 'kako koristiti tečno đubrivo'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateCommerceSeoDto.prototype, "relatedKeywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['kupiti tečno đubrivo', 'najbolje đubrivo za paradajz'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateCommerceSeoDto.prototype, "buyerIntentKeywords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tečna organska đubriva' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "targetCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'If set, loads active products from this category when products[] is empty' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CommerceSeoProductInputDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CommerceSeoProductInputDto),
    __metadata("design:type", Array)
], GenerateCommerceSeoDto.prototype, "products", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['https://kucabasta.rs/tecno-organsko-djubrivo'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateCommerceSeoDto.prototype, "internalLinks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'stručan, topao, prodajno orijentisan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "toneOfVoice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'sr-Latn' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'RS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Target length in words (defaults by content type if omitted)',
        minimum: 200,
        maximum: 6000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(6000),
    __metadata("design:type", Number)
], GenerateCommerceSeoDto.prototype, "wordCountTarget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Primary CTA placeholder URL or token, e.g. [LINK_TO_CATEGORY]',
        example: '[LINK_TO_CATEGORY]',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "ctaTarget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Extra store / brand constraints' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "brandNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'For FAQ_ONLY: short summary of existing page so FAQ matches context',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "contextSummary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'For PRODUCT: which product this page is for' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GenerateCommerceSeoDto.prototype, "primaryProductName", void 0);
//# sourceMappingURL=generate-commerce-seo.dto.js.map