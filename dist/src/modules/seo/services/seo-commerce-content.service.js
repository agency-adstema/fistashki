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
var SeoCommerceContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoCommerceContentService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../../../prisma/prisma.service");
const generate_commerce_seo_dto_1 = require("../dto/generate-commerce-seo.dto");
const client_1 = require("@prisma/client");
let SeoCommerceContentService = SeoCommerceContentService_1 = class SeoCommerceContentService {
    prisma;
    logger = new common_1.Logger(SeoCommerceContentService_1.name);
    apiKey = process.env.OPENAI_API_KEY;
    model = process.env.OPENAI_SEO_MODEL || 'gpt-4o-mini';
    constructor(prisma) {
        this.prisma = prisma;
    }
    defaultWordTarget(type) {
        switch (type) {
            case generate_commerce_seo_dto_1.CommerceContentType.CATEGORY_MONEY_PAGE:
                return 1600;
            case generate_commerce_seo_dto_1.CommerceContentType.PRODUCT:
                return 950;
            case generate_commerce_seo_dto_1.CommerceContentType.BLOG:
                return 1400;
            case generate_commerce_seo_dto_1.CommerceContentType.FAQ_ONLY:
            case generate_commerce_seo_dto_1.CommerceContentType.META_ONLY:
                return 0;
            default:
                return 1200;
        }
    }
    minWords(type) {
        switch (type) {
            case generate_commerce_seo_dto_1.CommerceContentType.CATEGORY_MONEY_PAGE:
                return 1200;
            case generate_commerce_seo_dto_1.CommerceContentType.PRODUCT:
                return 600;
            case generate_commerce_seo_dto_1.CommerceContentType.BLOG:
                return 900;
            case generate_commerce_seo_dto_1.CommerceContentType.FAQ_ONLY:
            case generate_commerce_seo_dto_1.CommerceContentType.META_ONLY:
                return 0;
            default:
                return 800;
        }
    }
    stripHtml(html) {
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    wordCount(html) {
        const t = this.stripHtml(html);
        if (!t)
            return 0;
        return t.split(/\s+/).filter(Boolean).length;
    }
    countH1(html) {
        return (html.match(/<h1\b/gi) || []).length;
    }
    countH2(html) {
        return (html.match(/<h2\b/gi) || []).length;
    }
    countH3(html) {
        return (html.match(/<h3\b/gi) || []).length;
    }
    parseJson(raw) {
        let text = raw.trim();
        const fence = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
        if (fence)
            text = fence[1].trim();
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
            throw new common_1.BadRequestException('AI response was not valid JSON object');
        }
        return {
            title: String(parsed.title || ''),
            metaTitle: String(parsed.metaTitle || ''),
            metaDescription: String(parsed.metaDescription || ''),
            contentHtml: String(parsed.contentHtml || ''),
            faq: Array.isArray(parsed.faq) ? parsed.faq : [],
            internalLinks: Array.isArray(parsed.internalLinks) ? parsed.internalLinks : [],
        };
    }
    async callOpenAi(systemPrompt, userMessage) {
        if (!this.apiKey) {
            throw new common_1.BadRequestException('OPENAI_API_KEY is not configured.');
        }
        const res = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: this.model,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.55,
            max_tokens: 14000,
        }, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 180000,
        });
        const content = res.data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
            throw new common_1.BadRequestException('Empty response from AI provider');
        }
        return content;
    }
    systemPromptFor(type) {
        const jsonShape = `You MUST respond with a single JSON object only, keys:
- title (string): page H1 title in Serbian Latin
- metaTitle (string): SEO title <= 60 characters
- metaDescription (string): SEO description 140–160 characters, compelling
- contentHtml (string): full body as semantic HTML only (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>). No markdown. Serbian Latin.
- faq (array of {question, answer}): Serbian Latin
- internalLinks (array of strings): include provided URLs and/or placeholders like [LINK_TO_CATEGORY], [LINK_TO_PRODUCTS]`;
        if (type === generate_commerce_seo_dto_1.CommerceContentType.CATEGORY_MONEY_PAGE) {
            return (`You are an expert SEO copywriter for ecommerce gardening / organic fertilizer stores in Serbia.\n` +
                `Write HIGH-QUALITY, NON-GENERIC Serbian (Latin) sales + SEO copy for a CATEGORY / MONEY PAGE.\n` +
                `Goal: rank for buyer + problem long-tail queries AND convert.\n\n` +
                `CRITICAL STYLE:\n` +
                `- Do NOT open with a dry definition like "X je ...". Start from a REAL problem the buyer feels.\n` +
                `- Do NOT sound like a textbook or generic AI. Be conversational but expert.\n` +
                `- Problem → explanation → solution → concrete products from OUR range → soft CTAs.\n` +
                `- Naturally weave main + related + buyer-intent keywords; never keyword stuff.\n` +
                `- Each paragraph must add practical value.\n\n` +
                `STRUCTURE (use these H2 themes in order; you may add H3 where useful):\n` +
                `1) <h1> with main keyword (once, at top)\n` +
                `2) Strong intro paragraphs (hook): doubt, symptoms, frustration in the garden\n` +
                `3) <h2> Zašto biljke ne napreduju / koji problem rešavamo</h2>\n` +
                `4) <h2> Šta je [category] (kratko, konkretno, bez školskog definišenja)</h2>\n` +
                `5) <h2> Kako ovo pomaže biljkama</h2> (benefits tied to real use)\n` +
                `6) <h2> Kako koristiti tečno / organsko đubrivo (praktičan vodič)</h2>\n` +
                `7) <h2> Koje proizvode izabrati iz naše ponude</h2> — MANDATORY buyer section: map EACH listed product to a clear use case; mention prices if given.\n` +
                `8) <h2> Najčešće greške</h2>\n` +
                `9) End body with a CTA paragraph that includes the literal placeholders [LINK_TO_CATEGORY] and [LINK_TO_PRODUCTS] and natural Serbian like "Pogledaj ponudu".\n` +
                `10) Put 5–7 FAQ items ALSO in the faq array (real shopper questions, short direct answers). Duplicating FAQ in HTML is optional but at least the JSON faq must be filled.\n\n` +
                `WORD COUNT: contentHtml alone must be at least the requested minimum word count (count words as visible text without HTML tags).\n\n` +
                jsonShape);
        }
        if (type === generate_commerce_seo_dto_1.CommerceContentType.PRODUCT) {
            return (`You are an expert SEO + conversion copywriter for a single PRODUCT page (ecommerce, Serbia, gardening / fertilizers).\n` +
                `Serbian Latin. Non-generic, expert, practical. Include: who it is for, benefits, how to use, dosage cautions, when to choose this vs alternatives, mistakes, FAQ.\n` +
                `Use semantic HTML in contentHtml as specified. Mention the primary product name often but naturally.\n` +
                `Include [LINK_TO_CATEGORY] and [LINK_TO_PRODUCTS] in a CTA paragraph.\n` +
                jsonShape);
        }
        if (type === generate_commerce_seo_dto_1.CommerceContentType.BLOG) {
            return (`You are an expert SEO editor writing a LONG educational BLOG article (NOT a category sales page).\n` +
                `Serbian Latin. Depth, originality, practical checklists, nuance. Avoid hard-sell opening; teach first, then suggest products softly in one section.\n` +
                `Still use HTML structure with h1/h2/h3. Include FAQ in the faq array (5–7). Internal links array.\n` +
                `This must NOT read like a catalog / money page; it should rank for informational intent.\n` +
                jsonShape);
        }
        if (type === generate_commerce_seo_dto_1.CommerceContentType.FAQ_ONLY) {
            return (`Generate ONLY FAQ + minimal meta for Serbian Latin.\n` +
                `title: short page title; metaTitle/metaDescription SEO; contentHtml empty string; faq 5–7 items; internalLinks may be empty or hints.\n` +
                `Questions must sound like real users (Google PAA style). Answers concise and useful.\n` +
                jsonShape);
        }
        return (`Generate ONLY metaTitle and metaDescription for Serbian Latin ecommerce SEO.\n` +
            `title can echo metaTitle; contentHtml MUST be empty string; faq empty array; internalLinks empty or optional hints.\n` +
            `metaTitle <= 60 chars; metaDescription 140–160 chars; buyer-oriented.\n` +
            jsonShape);
    }
    buildUserMessage(dto, products, wordTarget) {
        const lines = [];
        lines.push(`CONTENT_TYPE: ${dto.contentType}`);
        lines.push(`MAIN_KEYWORD: ${dto.mainKeyword}`);
        lines.push(`TARGET_CATEGORY_LABEL: ${dto.targetCategory}`);
        lines.push(`LANGUAGE: ${dto.language || 'sr-Latn'} (Latin script only)`);
        if (dto.country)
            lines.push(`COUNTRY: ${dto.country}`);
        if (dto.toneOfVoice)
            lines.push(`TONE: ${dto.toneOfVoice}`);
        if (dto.relatedKeywords?.length) {
            lines.push(`RELATED_KEYWORDS (use naturally): ${dto.relatedKeywords.join(', ')}`);
        }
        if (dto.buyerIntentKeywords?.length) {
            lines.push(`BUYER_INTENT_KEYWORDS (use naturally): ${dto.buyerIntentKeywords.join(', ')}`);
        }
        if (dto.internalLinks?.length) {
            lines.push(`INTERNAL_URLS_TO_WEAVE_IN: ${dto.internalLinks.join('\n')}`);
        }
        if (dto.ctaTarget) {
            lines.push(`PRIMARY_CTA_PLACEHOLDER_OR_URL: ${dto.ctaTarget}`);
        }
        if (dto.brandNotes) {
            lines.push(`BRAND_NOTES: ${dto.brandNotes}`);
        }
        if (dto.contextSummary && dto.contentType === generate_commerce_seo_dto_1.CommerceContentType.FAQ_ONLY) {
            lines.push(`PAGE_CONTEXT_FOR_FAQ: ${dto.contextSummary}`);
        }
        if (dto.primaryProductName && dto.contentType === generate_commerce_seo_dto_1.CommerceContentType.PRODUCT) {
            lines.push(`PRIMARY_PRODUCT: ${dto.primaryProductName}`);
        }
        lines.push(`TARGET_WORD_COUNT_FOR_contentHtml: ${wordTarget}`);
        if (products.length) {
            lines.push('PRODUCTS_TO_FEATURE (each must appear in buyer section / body where relevant):');
            for (const p of products) {
                const bits = [p.name];
                if (p.benefits)
                    bits.push(`benefits: ${p.benefits}`);
                if (p.priceDisplay)
                    bits.push(`price: ${p.priceDisplay}`);
                if (p.slug)
                    bits.push(`slug: ${p.slug}`);
                lines.push(`- ${bits.join(' | ')}`);
            }
        }
        else {
            lines.push('PRODUCTS_TO_FEATURE: (none provided — still write helpful category copy and CTAs)');
        }
        return lines.join('\n');
    }
    async resolveProducts(dto) {
        if (dto.products?.length) {
            return dto.products;
        }
        if (!dto.categoryId) {
            return [];
        }
        const rows = await this.prisma.productCategory.findMany({
            where: { categoryId: dto.categoryId },
            include: {
                product: {
                    select: {
                        name: true,
                        slug: true,
                        benefits: true,
                        shortDescription: true,
                        price: true,
                        currency: true,
                        isActive: true,
                        status: true,
                    },
                },
            },
            take: 40,
        });
        const out = [];
        for (const row of rows) {
            const p = row.product;
            if (!p.isActive || p.status !== client_1.ProductStatus.ACTIVE)
                continue;
            const priceNum = p.price != null ? Number(p.price) : null;
            const priceDisplay = priceNum != null && !Number.isNaN(priceNum)
                ? `${priceNum.toFixed(0)} ${p.currency || 'RSD'}`
                : undefined;
            out.push({
                name: p.name,
                benefits: p.benefits || p.shortDescription || undefined,
                slug: p.slug,
                priceDisplay,
            });
        }
        return out;
    }
    validate(type, out, dto, products, minW, wordTarget) {
        const checks = [];
        const failures = [];
        const wc = this.wordCount(out.contentHtml);
        const h1 = this.countH1(out.contentHtml);
        const h2 = this.countH2(out.contentHtml);
        const h3 = this.countH3(out.contentHtml);
        const push = (name, ok, detail) => {
            checks.push({ name, ok, detail });
            if (!ok)
                failures.push(detail || name);
        };
        if (type === generate_commerce_seo_dto_1.CommerceContentType.META_ONLY) {
            push('metaTitle length 20–70', out.metaTitle.length >= 20 && out.metaTitle.length <= 70, `metaTitle len=${out.metaTitle.length}`);
            push('metaDescription length 100–200', out.metaDescription.length >= 100 && out.metaDescription.length <= 200, `metaDescription len=${out.metaDescription.length}`);
            push('contentHtml empty', !out.contentHtml?.trim(), 'contentHtml should be empty for META_ONLY');
            push('faq empty', !out.faq?.length, 'faq should be empty for META_ONLY');
            return { passed: failures.length === 0, checks, failures };
        }
        if (type === generate_commerce_seo_dto_1.CommerceContentType.FAQ_ONLY) {
            push('faq count >= 5', (out.faq?.length || 0) >= 5, `faq count=${out.faq?.length || 0}`);
            const shortAns = (out.faq || []).filter((f) => (f.answer || '').trim().length < 25);
            push('faq answers substantial', shortAns.length === 0, `${shortAns.length} answers too short`);
            push('metaDescription present', out.metaDescription.length >= 80, 'metaDescription too short');
            return { passed: failures.length === 0, checks, failures };
        }
        push(`word count >= ${minW}`, wc >= minW, `words=${wc}, need>=${minW}, target≈${wordTarget}`);
        push('single H1 in HTML', h1 === 1, `h1 count=${h1}`);
        push('at least 5 H2', h2 >= 5, `h2 count=${h2}`);
        push('at least 1 H3 (depth)', h3 >= 1, `h3 count=${h3}`);
        push('FAQ array 5–7', (out.faq?.length || 0) >= 5 && (out.faq?.length || 0) <= 10, `faq count=${out.faq?.length || 0}`);
        const combined = `${out.contentHtml}\n${out.title}\n${out.metaDescription}`.toLowerCase();
        const mk = dto.mainKeyword.toLowerCase();
        push('main keyword in body', combined.includes(mk), 'main keyword missing in combined text');
        const placeholders = combined.includes('[link_to_category]') &&
            (combined.includes('[link_to_products]') ||
                combined.includes('[link_to_product]'));
        push('internal link placeholders', placeholders, 'Missing [LINK_TO_CATEGORY] and/or [LINK_TO_PRODUCTS]');
        const ctaSoft = combined.includes('pogledaj') ||
            combined.includes('kupi') ||
            combined.includes('poruči') ||
            combined.includes('ponud');
        push('CTA language present', ctaSoft, 'Add clearer Serbian CTA (e.g. pogledaj ponudu)');
        if (products.length) {
            for (const p of products) {
                const needle = p.name.toLowerCase();
                const hit = combined.includes(needle);
                push(`product mentioned: ${p.name}`, hit, `Missing product: ${p.name}`);
            }
        }
        return { passed: failures.length === 0, checks, failures };
    }
    async generate(dto) {
        if (!this.apiKey) {
            throw new common_1.BadRequestException('OPENAI_API_KEY is not configured.');
        }
        let products = await this.resolveProducts(dto);
        if (dto.contentType === generate_commerce_seo_dto_1.CommerceContentType.PRODUCT &&
            !products.length &&
            dto.primaryProductName) {
            products = [{ name: dto.primaryProductName }];
        }
        if (dto.contentType === generate_commerce_seo_dto_1.CommerceContentType.CATEGORY_MONEY_PAGE && !products.length) {
            throw new common_1.BadRequestException('Category / money page needs products[] or categoryId with active products in DB.');
        }
        if (dto.contentType === generate_commerce_seo_dto_1.CommerceContentType.PRODUCT && !products.length) {
            throw new common_1.BadRequestException('PRODUCT content needs primaryProductName or products[].');
        }
        const wordTarget = dto.wordCountTarget ?? this.defaultWordTarget(dto.contentType);
        const minW = this.minWords(dto.contentType);
        const systemBase = this.systemPromptFor(dto.contentType);
        let userMsg = this.buildUserMessage(dto, products, wordTarget);
        let last = null;
        let lastQuality = null;
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const raw = await this.callOpenAi(systemBase, userMsg);
            const parsed = this.parseJson(raw);
            const quality = this.validate(dto.contentType, parsed, dto, products, minW, wordTarget);
            last = parsed;
            lastQuality = quality;
            if (quality.passed) {
                return { data: parsed, quality, attempts: attempt, productsUsed: products };
            }
            this.logger.warn(`Commerce SEO attempt ${attempt} failed QC: ${quality.failures.join('; ')}`);
            if (attempt === maxAttempts) {
                break;
            }
            userMsg =
                this.buildUserMessage(dto, products, wordTarget) +
                    `\n\n=== REWRITE REQUIRED ===\nYour previous JSON failed automated quality checks:\n- ${quality.failures.join('\n- ')}\n` +
                    `Regenerate the ENTIRE JSON from scratch. Obey every rule; expand contentHtml if too short; fix headings and placeholders.`;
        }
        return {
            data: last,
            quality: lastQuality,
            attempts: maxAttempts,
            productsUsed: products,
        };
    }
};
exports.SeoCommerceContentService = SeoCommerceContentService;
exports.SeoCommerceContentService = SeoCommerceContentService = SeoCommerceContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoCommerceContentService);
//# sourceMappingURL=seo-commerce-content.service.js.map