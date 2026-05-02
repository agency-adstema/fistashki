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
exports.UpdateSeoKeywordDto = exports.CreateSeoKeywordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateSeoKeywordDto {
    keyword;
    intent;
    notes;
}
exports.CreateSeoKeywordDto = CreateSeoKeywordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target keyword phrase' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateSeoKeywordDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.KeywordIntent }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.KeywordIntent),
    __metadata("design:type", String)
], CreateSeoKeywordDto.prototype, "intent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoKeywordDto.prototype, "notes", void 0);
class UpdateSeoKeywordDto {
    keyword;
    intent;
    status;
    notes;
}
exports.UpdateSeoKeywordDto = UpdateSeoKeywordDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateSeoKeywordDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.KeywordIntent }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.KeywordIntent),
    __metadata("design:type", String)
], UpdateSeoKeywordDto.prototype, "intent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.SeoKeywordStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SeoKeywordStatus),
    __metadata("design:type", String)
], UpdateSeoKeywordDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeoKeywordDto.prototype, "notes", void 0);
//# sourceMappingURL=seo-keyword.dto.js.map