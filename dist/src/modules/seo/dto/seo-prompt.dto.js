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
exports.UpdateSeoPromptVersionDto = exports.CreateSeoPromptVersionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSeoPromptVersionDto {
    label;
    systemPrompt;
    userTemplate;
}
exports.CreateSeoPromptVersionDto = CreateSeoPromptVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'v2 — product-led' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateSeoPromptVersionDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'System instructions for SEO blog generation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateSeoPromptVersionDto.prototype, "systemPrompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User message template with placeholders {{targetKeyword}}, {{keywordIntent}}, {{category}}, {{relatedProducts}}, {{articleLength}}, {{internalLinksHint}}',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], CreateSeoPromptVersionDto.prototype, "userTemplate", void 0);
class UpdateSeoPromptVersionDto {
    label;
    systemPrompt;
    userTemplate;
    isActive;
}
exports.UpdateSeoPromptVersionDto = UpdateSeoPromptVersionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], UpdateSeoPromptVersionDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeoPromptVersionDto.prototype, "systemPrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeoPromptVersionDto.prototype, "userTemplate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Set true to deactivate others and use this prompt for new AI drafts',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSeoPromptVersionDto.prototype, "isActive", void 0);
//# sourceMappingURL=seo-prompt.dto.js.map