import { GenerateBlogDraftDto } from './dto/generate-blog-draft.dto';
import { CreateSeoKeywordDto, UpdateSeoKeywordDto } from './dto/seo-keyword.dto';
import { SeoKeywordQueryDto } from './dto/seo-keyword-query.dto';
import { CreateSeoPromptVersionDto, UpdateSeoPromptVersionDto } from './dto/seo-prompt.dto';
import { GenerateFromKeywordBodyDto } from './dto/generate-from-keyword.dto';
import { GenerateCommerceSeoDto } from './dto/generate-commerce-seo.dto';
import { SeoAiService } from './services/seo-ai.service';
import { SeoCommerceContentService } from './services/seo-commerce-content.service';
import { SeoKeywordsService } from './services/seo-keywords.service';
import { SeoDashboardService } from './services/seo-dashboard.service';
import { SeoPromptService } from './services/seo-prompt.service';
export declare class SeoController {
    private readonly ai;
    private readonly commerce;
    private readonly keywords;
    private readonly dashboard;
    private readonly prompts;
    constructor(ai: SeoAiService, commerce: SeoCommerceContentService, keywords: SeoKeywordsService, dashboard: SeoDashboardService, prompts: SeoPromptService);
    getDashboard(): Promise<{
        message: string;
        data: {
            totalBlogPosts: number;
            generatedAiDrafts: number;
            publishedArticles: number;
            archivedArticles: number;
            averageSeoScore: number | null;
            failedGenerations: number;
            topViewedArticles: {
                title: string;
                id: string;
                slug: string;
                seoScore: number | null;
                viewCount: number;
            }[];
            topProductClickArticles: {
                title: string;
                id: string;
                slug: string;
                seoScore: number | null;
                productClickCount: number;
            }[];
        };
    }>;
    generateDraft(dto: GenerateBlogDraftDto): Promise<{
        message: string;
        data: {
            blogPostId: string;
            usedMock: boolean;
            message: string;
        };
    }>;
    generateCommerceSeo(dto: GenerateCommerceSeoDto): Promise<{
        message: string;
        data: {
            quality: {
                passed: boolean;
                checks: Array<{
                    name: string;
                    ok: boolean;
                    detail?: string;
                }>;
                failures: string[];
            };
            attempts: number;
            productsUsed: import("./dto/generate-commerce-seo.dto").CommerceSeoProductInputDto[];
            title: string;
            metaTitle: string;
            metaDescription: string;
            contentHtml: string;
            faq: Array<{
                question: string;
                answer: string;
            }>;
            internalLinks: string[];
        };
    }>;
    listKeywords(q: SeoKeywordQueryDto): Promise<{
        message: string;
        data: {
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.SeoKeywordStatus;
                notes: string | null;
                blogPostId: string | null;
                keyword: string;
                intent: import(".prisma/client").$Enums.KeywordIntent | null;
            }[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    createKeyword(dto: CreateSeoKeywordDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SeoKeywordStatus;
            notes: string | null;
            blogPostId: string | null;
            keyword: string;
            intent: import(".prisma/client").$Enums.KeywordIntent | null;
        };
    }>;
    getKeyword(id: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SeoKeywordStatus;
            notes: string | null;
            blogPostId: string | null;
            keyword: string;
            intent: import(".prisma/client").$Enums.KeywordIntent | null;
        };
    }>;
    patchKeyword(id: string, dto: UpdateSeoKeywordDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SeoKeywordStatus;
            notes: string | null;
            blogPostId: string | null;
            keyword: string;
            intent: import(".prisma/client").$Enums.KeywordIntent | null;
        };
    }>;
    approveKeyword(id: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SeoKeywordStatus;
            notes: string | null;
            blogPostId: string | null;
            keyword: string;
            intent: import(".prisma/client").$Enums.KeywordIntent | null;
        };
    }>;
    rejectKeyword(id: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SeoKeywordStatus;
            notes: string | null;
            blogPostId: string | null;
            keyword: string;
            intent: import(".prisma/client").$Enums.KeywordIntent | null;
        };
    }>;
    generateFromKeyword(id: string, body: GenerateFromKeywordBodyDto): Promise<{
        message: string;
        data: {
            blogPostId: string;
            usedMock: boolean;
            message: string;
        };
    }>;
    deleteKeyword(id: string): Promise<{
        message: string;
    }>;
    listPrompts(): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            label: string;
            systemPrompt: string;
            userTemplate: string;
        }[];
    }>;
    createPrompt(dto: CreateSeoPromptVersionDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            label: string;
            systemPrompt: string;
            userTemplate: string;
        };
    }>;
    updatePrompt(id: string, dto: UpdateSeoPromptVersionDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            label: string;
            systemPrompt: string;
            userTemplate: string;
        };
    }>;
    activatePrompt(id: string): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            label: string;
            systemPrompt: string;
            userTemplate: string;
        };
    }>;
    deletePrompt(id: string): Promise<{
        message: string;
        data: {
            id: string;
            deleted: boolean;
        };
    }>;
}
