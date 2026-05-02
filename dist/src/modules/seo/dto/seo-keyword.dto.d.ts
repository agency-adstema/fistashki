import { KeywordIntent, SeoKeywordStatus } from '@prisma/client';
export declare class CreateSeoKeywordDto {
    keyword: string;
    intent?: KeywordIntent;
    notes?: string;
}
export declare class UpdateSeoKeywordDto {
    keyword?: string;
    intent?: KeywordIntent;
    status?: SeoKeywordStatus;
    notes?: string;
}
