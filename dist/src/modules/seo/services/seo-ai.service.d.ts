import { PrismaService } from '../../../prisma/prisma.service';
import { SeoScoringService } from './seo-scoring.service';
import { GenerateBlogDraftDto } from '../dto/generate-blog-draft.dto';
export declare class SeoAiService {
    private readonly prisma;
    private readonly scoring;
    private readonly logger;
    private readonly apiKey;
    private readonly model;
    constructor(prisma: PrismaService, scoring: SeoScoringService);
    private slugify;
    private ensureUniqueSlug;
    private parseJsonFromContent;
    private loadPromptVersion;
    private buildUserMessage;
    private callOpenAi;
    private mockDraft;
    generateDraft(dto: GenerateBlogDraftDto): Promise<{
        blogPostId: string;
        usedMock: boolean;
        message: string;
    }>;
    regeneratePost(blogPostId: string): Promise<{
        blogPostId: string;
        message: string;
    }>;
    generateFromKeyword(seoKeywordId: string, articleLengthWords?: number): Promise<{
        blogPostId: string;
        usedMock: boolean;
        message: string;
    }>;
}
