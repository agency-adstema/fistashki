import { PrismaService } from '../../../prisma/prisma.service';
export declare class SeoDashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
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
    }>;
}
