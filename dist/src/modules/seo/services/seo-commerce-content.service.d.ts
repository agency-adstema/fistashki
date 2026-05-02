import { PrismaService } from '../../../prisma/prisma.service';
import { CommerceSeoProductInputDto, GenerateCommerceSeoDto } from '../dto/generate-commerce-seo.dto';
export type CommerceSeoResultJson = {
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
type QualityReport = {
    passed: boolean;
    checks: Array<{
        name: string;
        ok: boolean;
        detail?: string;
    }>;
    failures: string[];
};
export declare class SeoCommerceContentService {
    private readonly prisma;
    private readonly logger;
    private readonly apiKey;
    private readonly model;
    constructor(prisma: PrismaService);
    private defaultWordTarget;
    private minWords;
    private stripHtml;
    private wordCount;
    private countH1;
    private countH2;
    private countH3;
    private parseJson;
    private callOpenAi;
    private systemPromptFor;
    private buildUserMessage;
    resolveProducts(dto: GenerateCommerceSeoDto): Promise<CommerceSeoProductInputDto[]>;
    private validate;
    generate(dto: GenerateCommerceSeoDto): Promise<{
        data: CommerceSeoResultJson;
        quality: QualityReport;
        attempts: number;
        productsUsed: CommerceSeoProductInputDto[];
    }>;
}
export {};
