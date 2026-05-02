"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const seo_controller_1 = require("./seo.controller");
const seo_ai_service_1 = require("./services/seo-ai.service");
const seo_keywords_service_1 = require("./services/seo-keywords.service");
const seo_dashboard_service_1 = require("./services/seo-dashboard.service");
const seo_prompt_service_1 = require("./services/seo-prompt.service");
const seo_scoring_service_1 = require("./services/seo-scoring.service");
const seo_commerce_content_service_1 = require("./services/seo-commerce-content.service");
let SeoModule = class SeoModule {
};
exports.SeoModule = SeoModule;
exports.SeoModule = SeoModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [seo_controller_1.SeoController],
        providers: [
            seo_scoring_service_1.SeoScoringService,
            seo_ai_service_1.SeoAiService,
            seo_commerce_content_service_1.SeoCommerceContentService,
            seo_keywords_service_1.SeoKeywordsService,
            seo_dashboard_service_1.SeoDashboardService,
            seo_prompt_service_1.SeoPromptService,
        ],
        exports: [seo_scoring_service_1.SeoScoringService, seo_ai_service_1.SeoAiService, seo_commerce_content_service_1.SeoCommerceContentService],
    })
], SeoModule);
//# sourceMappingURL=seo.module.js.map