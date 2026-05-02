import { KeywordIntent } from '@prisma/client';
export type BlogScoreInput = {
    title: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    excerpt?: string | null;
    content: string;
    targetKeyword?: string | null;
    seoKeywords?: string | null;
    keywordIntent?: KeywordIntent | null;
};
export declare class SeoScoringService {
    scoreBlogPost(input: BlogScoreInput): number;
}
