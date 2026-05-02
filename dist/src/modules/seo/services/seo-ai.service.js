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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SeoAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoAiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../../../prisma/prisma.service");
const seo_scoring_service_1 = require("./seo-scoring.service");
const client_1 = require("@prisma/client");
let SeoAiService = SeoAiService_1 = class SeoAiService {
    prisma;
    scoring;
    logger = new common_1.Logger(SeoAiService_1.name);
    apiKey = process.env.OPENAI_API_KEY;
    model = process.env.OPENAI_SEO_MODEL || 'gpt-4o-mini';
    constructor(prisma, scoring) {
        this.prisma = prisma;
        this.scoring = scoring;
    }
    slugify(title) {
        return title
            .trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 180);
    }
    async ensureUniqueSlug(base) {
        let slug = this.slugify(base) || 'post';
        let n = 0;
        while (await this.prisma.blogPost.findUnique({
            where: { slug },
        })) {
            n += 1;
            slug = `${this.slugify(base).slice(0, 160)}-${n}`;
        }
        return slug;
    }
    parseJsonFromContent(raw) {
        let text = raw.trim();
        const fence = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
        if (fence)
            text = fence[1].trim();
        try {
            return JSON.parse(text);
        }
        catch {
            throw new common_1.BadRequestException('AI response was not valid JSON');
        }
    }
    async loadPromptVersion(promptVersionId) {
        if (promptVersionId) {
            const v = await this.prisma.seoPromptVersion.findUnique({
                where: { id: promptVersionId },
            });
            if (!v)
                throw new common_1.NotFoundException(`Prompt version ${promptVersionId} not found`);
            return v;
        }
        const active = await this.prisma.seoPromptVersion.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' },
        });
        if (!active) {
            throw new common_1.BadRequestException('No active SEO prompt version. Create one under Prompt Settings.');
        }
        return active;
    }
    buildUserMessage(template, ctx) {
        return template
            .replace(/\{\{targetKeyword\}\}/g, ctx.targetKeyword)
            .replace(/\{\{keywordIntent\}\}/g, ctx.keywordIntent)
            .replace(/\{\{category\}\}/g, ctx.category)
            .replace(/\{\{relatedProducts\}\}/g, ctx.relatedProducts)
            .replace(/\{\{articleLength\}\}/g, String(ctx.articleLength))
            .replace(/\{\{internalLinksHint\}\}/g, ctx.internalLinksHint);
    }
    async callOpenAi(systemPrompt, userMessage) {
        if (!this.apiKey) {
            throw new common_1.BadRequestException('OPENAI_API_KEY is not configured; cannot generate AI drafts.');
        }
        const res = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: this.model,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.6,
            max_tokens: 8192,
        }, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        const content = res.data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
            throw new common_1.BadRequestException('Empty response from AI provider');
        }
        return content;
    }
    mockDraft(dto) {
        const title = `Guide: ${dto.targetKeyword}`;
        return {
            title,
            excerpt: `Learn about ${dto.targetKeyword} in the context of ${dto.category}.`,
            content: `## Introduction\n\nThis article covers **${dto.targetKeyword}** for readers with **${dto.keywordIntent}** intent.\n\n## Key points\n\n- Practical advice\n- Product suggestions\n- Next steps\n`,
            seoTitle: `${dto.targetKeyword} | ${dto.category}`,
            seoDescription: `Discover ${dto.targetKeyword} — actionable tips for your needs.`,
            faq: [{ question: `What is ${dto.targetKeyword}?`, answer: 'See the sections above.' }],
            internalLinks: dto.internalLinksHint?.length ? dto.internalLinksHint : [],
            readTime: Math.ceil(dto.articleLengthWords / 200),
        };
    }
    async generateDraft(dto) {
        const prompt = await this.loadPromptVersion(dto.promptVersionId);
        let productLines = '(none)';
        if (dto.relatedProductIds?.length) {
            const products = await this.prisma.product.findMany({
                where: { id: { in: dto.relatedProductIds } },
                select: { id: true, name: true },
            });
            productLines = products.map((p) => `- ${p.name} (${p.id})`).join('\n') || '(ids not found)';
        }
        const userMessage = this.buildUserMessage(prompt.userTemplate, {
            targetKeyword: dto.targetKeyword,
            keywordIntent: dto.keywordIntent,
            category: dto.category,
            relatedProducts: productLines,
            articleLength: dto.articleLengthWords,
            internalLinksHint: (dto.internalLinksHint || []).join('\n') || '(optional)',
        });
        let parsed;
        let usedMock = false;
        try {
            if (!this.apiKey) {
                parsed = this.mockDraft(dto);
                usedMock = true;
                this.logger.warn('OPENAI_API_KEY missing; returning mock draft.');
            }
            else {
                const raw = await this.callOpenAi(prompt.systemPrompt, userMessage);
                parsed = this.parseJsonFromContent(raw);
            }
        }
        catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            await this.prisma.seoGenerationLog.create({
                data: { status: 'FAILED', keywordRef: dto.targetKeyword, error: errMsg },
            });
            throw e instanceof common_1.BadRequestException
                ? e
                : new common_1.BadRequestException(`AI generation failed: ${errMsg}`);
        }
        const slug = await this.ensureUniqueSlug(parsed.slug || parsed.title || dto.targetKeyword);
        const author = (dto.author || process.env.BLOG_AI_DEFAULT_AUTHOR || 'AI Assistant').slice(0, 100);
        const mergedLinks = [...new Set([...(parsed.internalLinks || []), ...(dto.internalLinksHint || [])])];
        const faqPayload = parsed.faq?.length ? parsed.faq : undefined;
        const linksPayload = mergedLinks.length ? mergedLinks : undefined;
        const recommendedPayload = dto.relatedProductIds?.length
            ? dto.relatedProductIds
            : undefined;
        const seoTitle = (parsed.seoTitle || '').trim() ||
            `${parsed.title}`.slice(0, 120);
        const seoDescription = (parsed.seoDescription || '').trim() || `${parsed.excerpt || ''}`.slice(0, 160);
        const blogPost = await this.prisma.blogPost.create({
            data: {
                title: (parsed.title || dto.targetKeyword).slice(0, 200),
                slug,
                excerpt: (parsed.excerpt || parsed.title).slice(0, 500),
                content: parsed.content || '',
                category: dto.category,
                author,
                readTime: Math.min(60, Math.max(1, parsed.readTime || Math.ceil(dto.articleLengthWords / 200))),
                targetKeyword: dto.targetKeyword,
                keywordIntent: dto.keywordIntent,
                aiGenerated: true,
                promptVersionId: prompt.id,
                published: false,
                featuredImage: null,
                seoTitle,
                seoDescription,
                seoKeywords: dto.targetKeyword,
                ogTitle: seoTitle,
                ogDescription: seoDescription,
                ...(faqPayload !== undefined ? { faq: faqPayload } : {}),
                ...(linksPayload !== undefined ? { internalLinks: linksPayload } : {}),
                ...(recommendedPayload !== undefined ? { recommendedProductIds: recommendedPayload } : {}),
                lastGenerationError: usedMock ? 'MOCK: set OPENAI_API_KEY for real AI output' : null,
            },
        });
        const score = this.scoring.scoreBlogPost({
            title: blogPost.title,
            seoTitle: blogPost.seoTitle,
            seoDescription: blogPost.seoDescription,
            excerpt: blogPost.excerpt,
            content: blogPost.content,
            targetKeyword: blogPost.targetKeyword,
            seoKeywords: blogPost.seoKeywords,
            keywordIntent: blogPost.keywordIntent,
        });
        const updated = await this.prisma.blogPost.update({
            where: { id: blogPost.id },
            data: { seoScore: score },
        });
        await this.prisma.seoGenerationLog.create({
            data: {
                status: 'SUCCESS',
                blogPostId: updated.id,
                keywordRef: dto.targetKeyword,
            },
        });
        return { blogPostId: updated.id, usedMock, message: 'Draft created' };
    }
    async regeneratePost(blogPostId) {
        const existing = await this.prisma.blogPost.findUnique({ where: { id: blogPostId } });
        if (!existing)
            throw new common_1.NotFoundException(`Blog post ${blogPostId} not found`);
        if (!existing.targetKeyword) {
            throw new common_1.BadRequestException('Post has no targetKeyword; set it before regenerating.');
        }
        const dto = {
            targetKeyword: existing.targetKeyword,
            keywordIntent: existing.keywordIntent || client_1.KeywordIntent.GUIDE,
            category: existing.category,
            relatedProductIds: existing.recommendedProductIds || undefined,
            articleLengthWords: Math.max(400, (existing.content || '').split(/\s+/).length),
            promptVersionId: existing.promptVersionId || undefined,
            author: existing.author,
        };
        const prompt = await this.loadPromptVersion(dto.promptVersionId);
        let productLines = '(none)';
        const ids = existing.recommendedProductIds?.filter(Boolean);
        if (ids?.length) {
            const products = await this.prisma.product.findMany({
                where: { id: { in: ids } },
                select: { id: true, name: true },
            });
            productLines = products.map((p) => `- ${p.name} (${p.id})`).join('\n');
        }
        const userMessage = this.buildUserMessage(prompt.userTemplate, {
            targetKeyword: dto.targetKeyword,
            keywordIntent: dto.keywordIntent,
            category: dto.category,
            relatedProducts: productLines,
            articleLength: dto.articleLengthWords,
            internalLinksHint: existing.internalLinks?.join('\n') || '(optional)',
        });
        if (!this.apiKey) {
            throw new common_1.BadRequestException('OPENAI_API_KEY is not configured.');
        }
        try {
            const raw = await this.callOpenAi(`${prompt.systemPrompt}\nOverwrite existing article id=${blogPostId}.`, userMessage);
            const parsed = this.parseJsonFromContent(raw);
            const score = this.scoring.scoreBlogPost({
                title: parsed.title || existing.title,
                seoTitle: parsed.seoTitle,
                seoDescription: parsed.seoDescription,
                excerpt: parsed.excerpt,
                content: parsed.content,
                targetKeyword: existing.targetKeyword,
                seoKeywords: existing.seoKeywords,
                keywordIntent: existing.keywordIntent,
            });
            const updated = await this.prisma.blogPost.update({
                where: { id: blogPostId },
                data: {
                    title: (parsed.title || existing.title).slice(0, 200),
                    excerpt: (parsed.excerpt || existing.excerpt).slice(0, 500),
                    content: parsed.content || existing.content,
                    seoTitle: (parsed.seoTitle || existing.seoTitle)?.slice(0, 160) ?? null,
                    seoDescription: (parsed.seoDescription || existing.seoDescription)?.slice(0, 160) ?? null,
                    seoKeywords: existing.seoKeywords,
                    ogTitle: (parsed.seoTitle || parsed.title || existing.ogTitle)?.slice(0, 160) ?? null,
                    ogDescription: (parsed.seoDescription || parsed.excerpt || existing.ogDescription)?.slice(0, 160) ??
                        null,
                    readTime: parsed.readTime ||
                        Math.max(1, Math.ceil(((parsed.content || '').split(/\s+/).length || 200) / 200)),
                    ...(parsed.faq && parsed.faq.length > 0
                        ? { faq: parsed.faq }
                        : {}),
                    ...(parsed.internalLinks && parsed.internalLinks.length > 0
                        ? { internalLinks: parsed.internalLinks }
                        : {}),
                    aiGenerated: true,
                    promptVersionId: prompt.id,
                    seoScore: score,
                    published: false,
                    publishedAt: null,
                    lastGenerationError: null,
                },
            });
            await this.prisma.seoGenerationLog.create({
                data: { status: 'SUCCESS', blogPostId },
            });
            return { blogPostId: updated.id, message: 'Regenerated draft' };
        }
        catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            await this.prisma.blogPost.update({
                where: { id: blogPostId },
                data: { lastGenerationError: errMsg.slice(0, 2000) },
            });
            await this.prisma.seoGenerationLog.create({
                data: { status: 'FAILED', blogPostId, error: errMsg },
            });
            throw e instanceof common_1.BadRequestException
                ? e
                : new common_1.BadRequestException(`Regeneration failed: ${errMsg}`);
        }
    }
    async generateFromKeyword(seoKeywordId, articleLengthWords = 800) {
        const row = await this.prisma.seoKeyword.findUnique({ where: { id: seoKeywordId } });
        if (!row)
            throw new common_1.NotFoundException(`SEO keyword ${seoKeywordId} not found`);
        if (row.status !== 'APPROVED') {
            throw new common_1.ConflictException('Keyword must be APPROVED before generating an article');
        }
        const dto = {
            targetKeyword: row.keyword,
            keywordIntent: row.intent || client_1.KeywordIntent.GUIDE,
            category: process.env.SEO_DEFAULT_CATEGORY || 'General',
            articleLengthWords,
        };
        const result = await this.generateDraft(dto);
        await this.prisma.seoKeyword.update({
            where: { id: seoKeywordId },
            data: { blogPostId: result.blogPostId },
        });
        return result;
    }
};
exports.SeoAiService = SeoAiService;
exports.SeoAiService = SeoAiService = SeoAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        seo_scoring_service_1.SeoScoringService])
], SeoAiService);
//# sourceMappingURL=seo-ai.service.js.map