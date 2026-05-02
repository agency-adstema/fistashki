import { KeywordIntent } from '@prisma/client';
export declare class GenerateBlogDraftDto {
    targetKeyword: string;
    keywordIntent: KeywordIntent;
    category: string;
    relatedProductIds?: string[];
    articleLengthWords: number;
    promptVersionId?: string;
    author?: string;
    internalLinksHint?: string[];
}
