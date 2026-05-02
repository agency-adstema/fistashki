import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CommerceContentType,
  CommerceSeoProductInputDto,
  GenerateCommerceSeoDto,
} from '../dto/generate-commerce-seo.dto';
import { ProductStatus } from '@prisma/client';

export type CommerceSeoResultJson = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  contentHtml: string;
  faq: Array<{ question: string; answer: string }>;
  internalLinks: string[];
};

type QualityReport = {
  passed: boolean;
  checks: Array<{ name: string; ok: boolean; detail?: string }>;
  failures: string[];
};

@Injectable()
export class SeoCommerceContentService {
  private readonly logger = new Logger(SeoCommerceContentService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_SEO_MODEL || 'gpt-4o-mini';

  constructor(private readonly prisma: PrismaService) {}

  private defaultWordTarget(type: CommerceContentType): number {
    switch (type) {
      case CommerceContentType.CATEGORY_MONEY_PAGE:
        return 1600;
      case CommerceContentType.PRODUCT:
        return 950;
      case CommerceContentType.BLOG:
        return 1400;
      case CommerceContentType.FAQ_ONLY:
      case CommerceContentType.META_ONLY:
        return 0;
      default:
        return 1200;
    }
  }

  private minWords(type: CommerceContentType): number {
    switch (type) {
      case CommerceContentType.CATEGORY_MONEY_PAGE:
        return 1200;
      case CommerceContentType.PRODUCT:
        return 600;
      case CommerceContentType.BLOG:
        return 900;
      case CommerceContentType.FAQ_ONLY:
      case CommerceContentType.META_ONLY:
        return 0;
      default:
        return 800;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private wordCount(html: string): number {
    const t = this.stripHtml(html);
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
  }

  private countH1(html: string): number {
    return (html.match(/<h1\b/gi) || []).length;
  }

  private countH2(html: string): number {
    return (html.match(/<h2\b/gi) || []).length;
  }

  private countH3(html: string): number {
    return (html.match(/<h3\b/gi) || []).length;
  }

  private parseJson(raw: string): CommerceSeoResultJson {
    let text = raw.trim();
    const fence = text.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
    if (fence) text = fence[1].trim();
    const parsed = JSON.parse(text) as CommerceSeoResultJson;
    if (!parsed || typeof parsed !== 'object') {
      throw new BadRequestException('AI response was not valid JSON object');
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

  private async callOpenAi(systemPrompt: string, userMessage: string): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured.');
    }
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.55,
        max_tokens: 14000,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 180000,
      },
    );
    const content = res.data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new BadRequestException('Empty response from AI provider');
    }
    return content;
  }

  private systemPromptFor(type: CommerceContentType): string {
    const jsonShape = `You MUST respond with a single JSON object only, keys:
- title (string): page H1 title in Serbian Latin
- metaTitle (string): SEO title <= 60 characters
- metaDescription (string): SEO description 140–160 characters, compelling
- contentHtml (string): full body as semantic HTML only (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>). No markdown. Serbian Latin.
- faq (array of {question, answer}): Serbian Latin
- internalLinks (array of strings): include provided URLs and/or placeholders like [LINK_TO_CATEGORY], [LINK_TO_PRODUCTS]`;

    if (type === CommerceContentType.CATEGORY_MONEY_PAGE) {
      return (
        `You are an expert SEO copywriter for ecommerce gardening / organic fertilizer stores in Serbia.\n` +
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
        jsonShape
      );
    }

    if (type === CommerceContentType.PRODUCT) {
      return (
        `You are an expert SEO + conversion copywriter for a single PRODUCT page (ecommerce, Serbia, gardening / fertilizers).\n` +
        `Serbian Latin. Non-generic, expert, practical. Include: who it is for, benefits, how to use, dosage cautions, when to choose this vs alternatives, mistakes, FAQ.\n` +
        `Use semantic HTML in contentHtml as specified. Mention the primary product name often but naturally.\n` +
        `Include [LINK_TO_CATEGORY] and [LINK_TO_PRODUCTS] in a CTA paragraph.\n` +
        jsonShape
      );
    }

    if (type === CommerceContentType.BLOG) {
      return (
        `You are an expert SEO editor writing a LONG educational BLOG article (NOT a category sales page).\n` +
        `Serbian Latin. Depth, originality, practical checklists, nuance. Avoid hard-sell opening; teach first, then suggest products softly in one section.\n` +
        `Still use HTML structure with h1/h2/h3. Include FAQ in the faq array (5–7). Internal links array.\n` +
        `This must NOT read like a catalog / money page; it should rank for informational intent.\n` +
        jsonShape
      );
    }

    if (type === CommerceContentType.FAQ_ONLY) {
      return (
        `Generate ONLY FAQ + minimal meta for Serbian Latin.\n` +
        `title: short page title; metaTitle/metaDescription SEO; contentHtml empty string; faq 5–7 items; internalLinks may be empty or hints.\n` +
        `Questions must sound like real users (Google PAA style). Answers concise and useful.\n` +
        jsonShape
      );
    }

    // META_ONLY
    return (
      `Generate ONLY metaTitle and metaDescription for Serbian Latin ecommerce SEO.\n` +
      `title can echo metaTitle; contentHtml MUST be empty string; faq empty array; internalLinks empty or optional hints.\n` +
      `metaTitle <= 60 chars; metaDescription 140–160 chars; buyer-oriented.\n` +
      jsonShape
    );
  }

  private buildUserMessage(dto: GenerateCommerceSeoDto, products: CommerceSeoProductInputDto[], wordTarget: number): string {
    const lines: string[] = [];
    lines.push(`CONTENT_TYPE: ${dto.contentType}`);
    lines.push(`MAIN_KEYWORD: ${dto.mainKeyword}`);
    lines.push(`TARGET_CATEGORY_LABEL: ${dto.targetCategory}`);
    lines.push(`LANGUAGE: ${dto.language || 'sr-Latn'} (Latin script only)`);
    if (dto.country) lines.push(`COUNTRY: ${dto.country}`);
    if (dto.toneOfVoice) lines.push(`TONE: ${dto.toneOfVoice}`);
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
    if (dto.contextSummary && dto.contentType === CommerceContentType.FAQ_ONLY) {
      lines.push(`PAGE_CONTEXT_FOR_FAQ: ${dto.contextSummary}`);
    }
    if (dto.primaryProductName && dto.contentType === CommerceContentType.PRODUCT) {
      lines.push(`PRIMARY_PRODUCT: ${dto.primaryProductName}`);
    }

    lines.push(`TARGET_WORD_COUNT_FOR_contentHtml: ${wordTarget}`);

    if (products.length) {
      lines.push('PRODUCTS_TO_FEATURE (each must appear in buyer section / body where relevant):');
      for (const p of products) {
        const bits = [p.name];
        if (p.benefits) bits.push(`benefits: ${p.benefits}`);
        if (p.priceDisplay) bits.push(`price: ${p.priceDisplay}`);
        if (p.slug) bits.push(`slug: ${p.slug}`);
        lines.push(`- ${bits.join(' | ')}`);
      }
    } else {
      lines.push('PRODUCTS_TO_FEATURE: (none provided — still write helpful category copy and CTAs)');
    }

    return lines.join('\n');
  }

  async resolveProducts(dto: GenerateCommerceSeoDto): Promise<CommerceSeoProductInputDto[]> {
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
    const out: CommerceSeoProductInputDto[] = [];
    for (const row of rows) {
      const p = row.product;
      if (!p.isActive || p.status !== ProductStatus.ACTIVE) continue;
      const priceNum = p.price != null ? Number(p.price) : null;
      const priceDisplay =
        priceNum != null && !Number.isNaN(priceNum)
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

  private validate(
    type: CommerceContentType,
    out: CommerceSeoResultJson,
    dto: GenerateCommerceSeoDto,
    products: CommerceSeoProductInputDto[],
    minW: number,
    wordTarget: number,
  ): QualityReport {
    const checks: QualityReport['checks'] = [];
    const failures: string[] = [];

    const wc = this.wordCount(out.contentHtml);
    const h1 = this.countH1(out.contentHtml);
    const h2 = this.countH2(out.contentHtml);
    const h3 = this.countH3(out.contentHtml);

    const push = (name: string, ok: boolean, detail?: string) => {
      checks.push({ name, ok, detail });
      if (!ok) failures.push(detail || name);
    };

    if (type === CommerceContentType.META_ONLY) {
      push('metaTitle length 20–70', out.metaTitle.length >= 20 && out.metaTitle.length <= 70, `metaTitle len=${out.metaTitle.length}`);
      push(
        'metaDescription length 100–200',
        out.metaDescription.length >= 100 && out.metaDescription.length <= 200,
        `metaDescription len=${out.metaDescription.length}`,
      );
      push('contentHtml empty', !out.contentHtml?.trim(), 'contentHtml should be empty for META_ONLY');
      push('faq empty', !out.faq?.length, 'faq should be empty for META_ONLY');
      return { passed: failures.length === 0, checks, failures };
    }

    if (type === CommerceContentType.FAQ_ONLY) {
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

    const placeholders =
      combined.includes('[link_to_category]') &&
      (combined.includes('[link_to_products]') ||
        combined.includes('[link_to_product]'));
    push('internal link placeholders', placeholders, 'Missing [LINK_TO_CATEGORY] and/or [LINK_TO_PRODUCTS]');

    const ctaSoft =
      combined.includes('pogledaj') ||
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

  async generate(dto: GenerateCommerceSeoDto): Promise<{
    data: CommerceSeoResultJson;
    quality: QualityReport;
    attempts: number;
    productsUsed: CommerceSeoProductInputDto[];
  }> {
    if (!this.apiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured.');
    }

    let products = await this.resolveProducts(dto);
    if (
      dto.contentType === CommerceContentType.PRODUCT &&
      !products.length &&
      dto.primaryProductName
    ) {
      products = [{ name: dto.primaryProductName }];
    }
    if (dto.contentType === CommerceContentType.CATEGORY_MONEY_PAGE && !products.length) {
      throw new BadRequestException(
        'Category / money page needs products[] or categoryId with active products in DB.',
      );
    }
    if (dto.contentType === CommerceContentType.PRODUCT && !products.length) {
      throw new BadRequestException('PRODUCT content needs primaryProductName or products[].');
    }

    const wordTarget = dto.wordCountTarget ?? this.defaultWordTarget(dto.contentType);
    const minW = this.minWords(dto.contentType);

    const systemBase = this.systemPromptFor(dto.contentType);
    let userMsg = this.buildUserMessage(dto, products, wordTarget);
    let last: CommerceSeoResultJson | null = null;
    let lastQuality: QualityReport | null = null;

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
      data: last as CommerceSeoResultJson,
      quality: lastQuality as QualityReport,
      attempts: maxAttempts,
      productsUsed: products,
    };
  }
}
