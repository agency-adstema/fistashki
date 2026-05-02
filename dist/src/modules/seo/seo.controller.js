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
exports.SeoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const generate_blog_draft_dto_1 = require("./dto/generate-blog-draft.dto");
const seo_keyword_dto_1 = require("./dto/seo-keyword.dto");
const seo_keyword_query_dto_1 = require("./dto/seo-keyword-query.dto");
const seo_prompt_dto_1 = require("./dto/seo-prompt.dto");
const generate_from_keyword_dto_1 = require("./dto/generate-from-keyword.dto");
const generate_commerce_seo_dto_1 = require("./dto/generate-commerce-seo.dto");
const seo_ai_service_1 = require("./services/seo-ai.service");
const seo_commerce_content_service_1 = require("./services/seo-commerce-content.service");
const seo_keywords_service_1 = require("./services/seo-keywords.service");
const seo_dashboard_service_1 = require("./services/seo-dashboard.service");
const seo_prompt_service_1 = require("./services/seo-prompt.service");
const client_1 = require("@prisma/client");
let SeoController = class SeoController {
    ai;
    commerce;
    keywords;
    dashboard;
    prompts;
    constructor(ai, commerce, keywords, dashboard, prompts) {
        this.ai = ai;
        this.commerce = commerce;
        this.keywords = keywords;
        this.dashboard = dashboard;
        this.prompts = prompts;
    }
    async getDashboard() {
        const data = await this.dashboard.getSummary();
        return { message: 'SEO dashboard', data };
    }
    async generateDraft(dto) {
        const data = await this.ai.generateDraft(dto);
        return { message: data.message, data };
    }
    async generateCommerceSeo(dto) {
        const result = await this.commerce.generate(dto);
        return {
            message: result.quality.passed
                ? 'Commerce SEO generated and passed quality checks'
                : 'Commerce SEO generated but some quality checks failed after retries — review before publish',
            data: {
                ...result.data,
                quality: result.quality,
                attempts: result.attempts,
                productsUsed: result.productsUsed,
            },
        };
    }
    async listKeywords(q) {
        const data = await this.keywords.findAll(q.page, q.limit, q.status);
        return { message: 'SEO keywords', data };
    }
    async createKeyword(dto) {
        const data = await this.keywords.create(dto);
        return { message: 'Keyword created', data };
    }
    async getKeyword(id) {
        const data = await this.keywords.findOne(id);
        return { message: 'SEO keyword', data };
    }
    async patchKeyword(id, dto) {
        const data = await this.keywords.update(id, dto);
        return { message: 'Keyword updated', data };
    }
    async approveKeyword(id) {
        const data = await this.keywords.setStatus(id, client_1.SeoKeywordStatus.APPROVED);
        return { message: 'Keyword approved', data };
    }
    async rejectKeyword(id) {
        const data = await this.keywords.setStatus(id, client_1.SeoKeywordStatus.REJECTED);
        return { message: 'Keyword rejected', data };
    }
    async generateFromKeyword(id, body) {
        const data = await this.ai.generateFromKeyword(id, body.articleLengthWords ?? 800);
        return { message: 'Article draft generated from keyword', data };
    }
    async deleteKeyword(id) {
        await this.keywords.remove(id);
        return { message: 'Keyword deleted' };
    }
    async listPrompts() {
        const data = await this.prompts.findAll();
        return { message: 'Prompt versions', data };
    }
    async createPrompt(dto) {
        const data = await this.prompts.create(dto);
        return { message: 'Prompt version created', data };
    }
    async updatePrompt(id, dto) {
        const data = await this.prompts.update(id, dto);
        return { message: 'Prompt version updated', data };
    }
    async activatePrompt(id) {
        const data = await this.prompts.activate(id);
        return { message: 'Prompt version activated', data };
    }
    async deletePrompt(id) {
        const data = await this.prompts.remove(id);
        return { message: 'Prompt version deleted', data };
    }
};
exports.SeoController = SeoController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, permissions_decorator_1.Permissions)('blog.read'),
    (0, swagger_1.ApiOperation)({ summary: 'SEO dashboard metrics for Blog / CMS' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('generate-draft'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate a blog post draft with AI (not published)',
        description: 'Uses DB prompt versions (SeoPromptVersion). For category / money pages and structured commerce copy, use POST /seo/generate-commerce-seo instead.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_blog_draft_dto_1.GenerateBlogDraftDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "generateDraft", null);
__decorate([
    (0, common_1.Post)('generate-commerce-seo'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate ecommerce SEO + sales copy (category, product, blog, FAQ, meta)',
        description: 'Dedicated prompts per contentType (not the blog prompt DB). Returns JSON: title, metaTitle, metaDescription, contentHtml, faq[], internalLinks[]. ' +
            'Category/money pages default ~1600 words, min 1200, with QC + up to 3 auto-retries. Pass products[] or categoryId.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_commerce_seo_dto_1.GenerateCommerceSeoDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "generateCommerceSeo", null);
__decorate([
    (0, common_1.Get)('keywords'),
    (0, permissions_decorator_1.Permissions)('blog.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List SEO keywords (filters for Keywords tab)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_keyword_query_dto_1.SeoKeywordQueryDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "listKeywords", null);
__decorate([
    (0, common_1.Post)('keywords'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a keyword' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_keyword_dto_1.CreateSeoKeywordDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "createKeyword", null);
__decorate([
    (0, common_1.Get)('keywords/:id'),
    (0, permissions_decorator_1.Permissions)('blog.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one keyword' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "getKeyword", null);
__decorate([
    (0, common_1.Patch)('keywords/:id'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update keyword (including approve/reject via status)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seo_keyword_dto_1.UpdateSeoKeywordDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "patchKeyword", null);
__decorate([
    (0, common_1.Post)('keywords/:id/approve'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve keyword' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "approveKeyword", null);
__decorate([
    (0, common_1.Post)('keywords/:id/reject'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject keyword' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "rejectKeyword", null);
__decorate([
    (0, common_1.Post)('keywords/:id/generate-article'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate draft article from an approved keyword' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_from_keyword_dto_1.GenerateFromKeywordBodyDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "generateFromKeyword", null);
__decorate([
    (0, common_1.Delete)('keywords/:id'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete keyword' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "deleteKeyword", null);
__decorate([
    (0, common_1.Get)('prompt-versions'),
    (0, permissions_decorator_1.Permissions)('blog.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List SEO AI prompt versions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "listPrompts", null);
__decorate([
    (0, common_1.Post)('prompt-versions'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Create prompt version' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_prompt_dto_1.CreateSeoPromptVersionDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "createPrompt", null);
__decorate([
    (0, common_1.Patch)('prompt-versions/:id'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update prompt version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seo_prompt_dto_1.UpdateSeoPromptVersionDto]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "updatePrompt", null);
__decorate([
    (0, common_1.Post)('prompt-versions/:id/activate'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate prompt version (deactivates others)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "activatePrompt", null);
__decorate([
    (0, common_1.Delete)('prompt-versions/:id'),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete unused prompt version' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "deletePrompt", null);
exports.SeoController = SeoController = __decorate([
    (0, swagger_1.ApiTags)('SEO Blog / CMS'),
    (0, common_1.Controller)('seo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    __metadata("design:paramtypes", [seo_ai_service_1.SeoAiService,
        seo_commerce_content_service_1.SeoCommerceContentService,
        seo_keywords_service_1.SeoKeywordsService,
        seo_dashboard_service_1.SeoDashboardService,
        seo_prompt_service_1.SeoPromptService])
], SeoController);
//# sourceMappingURL=seo.controller.js.map