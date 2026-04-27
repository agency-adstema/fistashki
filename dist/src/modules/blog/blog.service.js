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
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BlogService = class BlogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.blogPost.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`Blog post with slug "${dto.slug}" already exists`);
        }
        const blogPost = await this.prisma.blogPost.create({
            data: {
                ...dto,
                readTime: dto.readTime || 5,
                publishedAt: dto.published ? new Date() : null,
            },
        });
        return this.formatResponse(blogPost);
    }
    async findAll(query) {
        const { page = 1, limit = 10, category, published, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (category) {
            where.category = { contains: category, mode: 'insensitive' };
        }
        if (published !== undefined) {
            where.published = published;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            this.prisma.blogPost.count({ where }),
        ]);
        return {
            items: items.map(this.formatResponse),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const blogPost = await this.prisma.blogPost.findUnique({
            where: { id },
        });
        if (!blogPost) {
            throw new common_1.NotFoundException(`Blog post with id "${id}" not found`);
        }
        return this.formatResponse(blogPost);
    }
    async findBySlug(slug) {
        const blogPost = await this.prisma.blogPost.findUnique({
            where: { slug },
        });
        if (!blogPost) {
            throw new common_1.NotFoundException(`Blog post with slug "${slug}" not found`);
        }
        return this.formatResponse(blogPost);
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.slug) {
            const existing = await this.prisma.blogPost.findUnique({
                where: { slug: dto.slug },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Blog post with slug "${dto.slug}" already exists`);
            }
        }
        const blogPost = await this.prisma.blogPost.update({
            where: { id },
            data: {
                ...dto,
                publishedAt: dto.published === true && !dto.published ? new Date() : undefined,
            },
        });
        return this.formatResponse(blogPost);
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.blogPost.delete({
            where: { id },
        });
    }
    async getCategories() {
        const results = await this.prisma.blogPost.findMany({
            distinct: ['category'],
            select: { category: true },
        });
        return results.map((r) => r.category).sort();
    }
    async getRelatedPosts(postId, limit = 3) {
        const post = await this.findOne(postId);
        const relatedPosts = await this.prisma.blogPost.findMany({
            where: {
                AND: [
                    { id: { not: postId } },
                    { category: post.category },
                    { published: true },
                ],
            },
            take: limit,
            orderBy: { publishedAt: 'desc' },
        });
        return relatedPosts.map(this.formatResponse);
    }
    formatResponse(blogPost) {
        return {
            id: blogPost.id,
            title: blogPost.title,
            slug: blogPost.slug,
            excerpt: blogPost.excerpt,
            content: blogPost.content,
            featuredImage: blogPost.featuredImage,
            category: blogPost.category,
            author: blogPost.author,
            readTime: blogPost.readTime,
            seoTitle: blogPost.seoTitle,
            seoDescription: blogPost.seoDescription,
            seoKeywords: blogPost.seoKeywords,
            ogImage: blogPost.ogImage,
            ogTitle: blogPost.ogTitle,
            ogDescription: blogPost.ogDescription,
            published: blogPost.published,
            publishedAt: blogPost.publishedAt,
            createdAt: blogPost.createdAt,
            updatedAt: blogPost.updatedAt,
        };
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map