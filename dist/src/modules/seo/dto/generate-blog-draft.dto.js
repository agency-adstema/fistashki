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
exports.GenerateBlogDraftDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class GenerateBlogDraftDto {
    targetKeyword;
    keywordIntent;
    category;
    relatedProductIds;
    articleLengthWords;
    promptVersionId;
    author;
    internalLinksHint;
}
exports.GenerateBlogDraftDto = GenerateBlogDraftDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Primary keyword to optimize for', example: 'organic fertilizer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GenerateBlogDraftDto.prototype, "targetKeyword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.KeywordIntent, description: 'Search intent' }),
    (0, class_validator_1.IsEnum)(client_1.KeywordIntent),
    __metadata("design:type", String)
], GenerateBlogDraftDto.prototype, "keywordIntent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Blog category label', example: 'Gardening' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], GenerateBlogDraftDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product IDs to feature', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateBlogDraftDto.prototype, "relatedProductIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target length (approximate word count bucket)',
        example: 800,
        minimum: 200,
        maximum: 8000,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(8000),
    __metadata("design:type", Number)
], GenerateBlogDraftDto.prototype, "articleLengthWords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific prompt version id (defaults to active)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateBlogDraftDto.prototype, "promptVersionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Author attribution for drafts',
        example: 'Marketing Team',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], GenerateBlogDraftDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Internal links to weave in', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateBlogDraftDto.prototype, "internalLinksHint", void 0);
//# sourceMappingURL=generate-blog-draft.dto.js.map