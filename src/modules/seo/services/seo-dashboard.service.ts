import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SeoDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      totalPosts,
      aiDrafts,
      publishedCount,
      archivedCount,
      scoreAgg,
      failedGenerations,
      topViews,
      topClicks,
    ] = await Promise.all([
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({
        where: { aiGenerated: true, published: false, archived: false },
      }),
      this.prisma.blogPost.count({
        where: { published: true, archived: false },
      }),
      this.prisma.blogPost.count({ where: { archived: true } }),
      this.prisma.blogPost.aggregate({
        _avg: { seoScore: true },
        where: { seoScore: { not: null } },
      }),
      this.prisma.seoGenerationLog.count({ where: { status: 'FAILED' } }),
      this.prisma.blogPost.findMany({
        where: { published: true, archived: false },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          seoScore: true,
        },
      }),
      this.prisma.blogPost.findMany({
        where: { published: true, archived: false },
        orderBy: { productClickCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          productClickCount: true,
          seoScore: true,
        },
      }),
    ]);

    return {
      totalBlogPosts: totalPosts,
      generatedAiDrafts: aiDrafts,
      publishedArticles: publishedCount,
      archivedArticles: archivedCount,
      averageSeoScore: scoreAgg._avg.seoScore != null
        ? Math.round(scoreAgg._avg.seoScore * 10) / 10
        : null,
      failedGenerations,
      topViewedArticles: topViews,
      topProductClickArticles: topClicks,
    };
  }
}
