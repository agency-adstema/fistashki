import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSeoKeywordDto, UpdateSeoKeywordDto } from '../dto/seo-keyword.dto';
import { SeoKeywordStatus } from '@prisma/client';
export declare class SeoKeywordsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateSeoKeywordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SeoKeywordStatus;
        notes: string | null;
        blogPostId: string | null;
        keyword: string;
        intent: import(".prisma/client").$Enums.KeywordIntent | null;
    }>;
    findAll(page?: number, limit?: number, status?: SeoKeywordStatus): Promise<{
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
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SeoKeywordStatus;
        notes: string | null;
        blogPostId: string | null;
        keyword: string;
        intent: import(".prisma/client").$Enums.KeywordIntent | null;
    }>;
    update(id: string, dto: UpdateSeoKeywordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SeoKeywordStatus;
        notes: string | null;
        blogPostId: string | null;
        keyword: string;
        intent: import(".prisma/client").$Enums.KeywordIntent | null;
    }>;
    setStatus(id: string, status: SeoKeywordStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SeoKeywordStatus;
        notes: string | null;
        blogPostId: string | null;
        keyword: string;
        intent: import(".prisma/client").$Enums.KeywordIntent | null;
    }>;
    remove(id: string): Promise<void>;
}
