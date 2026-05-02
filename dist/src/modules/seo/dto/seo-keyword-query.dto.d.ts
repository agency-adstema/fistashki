import { SeoKeywordStatus } from '@prisma/client';
export declare class SeoKeywordQueryDto {
    page?: number;
    limit?: number;
    status?: SeoKeywordStatus;
}
