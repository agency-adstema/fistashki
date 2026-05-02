"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoScoringService = void 0;
const common_1 = require("@nestjs/common");
let SeoScoringService = class SeoScoringService {
    scoreBlogPost(input) {
        let score = 0;
        const primary = (input.targetKeyword || input.seoKeywords || '')
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)[0];
        const title = (input.title || '').toLowerCase();
        const seoTitle = (input.seoTitle || '').toLowerCase();
        const meta = (input.seoDescription || '').toLowerCase();
        const body = (input.content || '').toLowerCase();
        const excerpt = (input.excerpt || '').toLowerCase();
        if (primary) {
            if (title.includes(primary))
                score += 18;
            if (seoTitle.includes(primary))
                score += 8;
            if (meta.includes(primary))
                score += 14;
            if (body.includes(primary))
                score += 12;
            if (excerpt.includes(primary))
                score += 6;
        }
        else {
            score += 10;
        }
        const metaLen = (input.seoDescription || '').length;
        if (metaLen >= 120 && metaLen <= 160)
            score += 15;
        else if (metaLen >= 80)
            score += 8;
        else if (metaLen > 0)
            score += 4;
        const titleLen = (input.seoTitle || input.title || '').length;
        if (titleLen >= 30 && titleLen <= 70)
            score += 10;
        else if (titleLen > 0)
            score += 5;
        const words = (input.content || '').split(/\s+/).filter(Boolean).length;
        if (words >= 600)
            score += 12;
        else if (words >= 300)
            score += 8;
        else if (words >= 150)
            score += 4;
        if (/^#{1,2}\s/m.test(input.content || '') || (input.content || '').includes('## ')) {
            score += 8;
        }
        if (input.keywordIntent)
            score += 4;
        return Math.min(100, Math.round(score));
    }
};
exports.SeoScoringService = SeoScoringService;
exports.SeoScoringService = SeoScoringService = __decorate([
    (0, common_1.Injectable)()
], SeoScoringService);
//# sourceMappingURL=seo-scoring.service.js.map