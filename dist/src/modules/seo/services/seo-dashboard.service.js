"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SeoDashboardService = class SeoDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const [totalPosts, aiDrafts, publishedCount, archivedCount, scoreAgg, failedGenerations, topViews, topClicks,] = await Promise.all([
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
};
exports.SeoDashboardService = SeoDashboardService;
exports.SeoDashboardService = SeoDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoDashboardService);
//# sourceMappingURL=seo-dashboard.service.js.map