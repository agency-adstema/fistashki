import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import {
  BlogPostResponseDto,
  BlogPostListResponseDto,
  BlogDisplayStatus,
} from './dto/blog-post-response.dto';
import { SeoScoringService } from '../seo/services/seo-scoring.service';

const SORT_FIELDS = new Set([
  'createdAt',
  'publishedAt',
  'title',
  'updatedAt',
  'seoScore',
  'viewCount',
  'productClickCount',
]);

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seoScoring: SeoScoringService,
  ) {}

  async create(dto: CreateBlogPostDto): Promise<BlogPostResponseDto> {
    const slug =
      dto.slug?.trim() ||
      dto.title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
    const published = dto.published ?? true;

    const existing = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Blog post with slug "${slug}" already exists`);
    }

    const blogPost = await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt?.trim() || dto.content.slice(0, 160) || dto.title,
        content: dto.content,
        featuredImage: dto.featuredImage?.trim() || null,
        category: dto.category,
        author: dto.author,
        readTime: dto.readTime || 5,
        seoTitle: dto.seoTitle?.trim() || null,
        seoDescription: dto.seoDescription?.trim() || null,
        seoKeywords: dto.seoKeywords?.trim() || null,
        ogImage: dto.ogImage?.trim() || null,
        ogTitle: dto.ogTitle?.trim() || null,
        ogDescription: dto.ogDescription?.trim() || null,
        published,
        publishedAt: published ? new Date() : null,
        targetKeyword: dto.targetKeyword?.trim() || null,
        keywordIntent: dto.keywordIntent ?? null,
        seoScore: dto.seoScore ?? null,
        faq: dto.faq?.length ? (dto.faq as unknown as Prisma.InputJsonValue) : undefined,
        internalLinks:
          dto.internalLinks && dto.internalLinks.length > 0
            ? (dto.internalLinks as Prisma.InputJsonValue)
            : undefined,
        recommendedProductIds: dto.recommendedProductIds?.length
          ? (dto.recommendedProductIds as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return this.formatResponse(blogPost);
  }

  async findAll(query: BlogPostQueryDto): Promise<BlogPostListResponseDto> {
    const {
      page = 1,
      limit = 10,
      category,
      published,
      archived,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {};

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (published !== undefined) {
      where.published = published;
    }

    if (archived === true) {
      where.archived = true;
    } else if (archived === false) {
      where.archived = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const safeSort = SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [safeSort]: sortOrder,
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      items: items.map((item) => this.formatResponse(item)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<BlogPostResponseDto> {
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!blogPost) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }

    return this.formatResponse(blogPost);
  }

  async findBySlug(slug: string): Promise<BlogPostResponseDto> {
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!blogPost) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    if (!blogPost.published || blogPost.archived) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    return this.formatResponse(blogPost);
  }

  /** Public route: increments viewCount (call from storefront after loading post). */
  async recordView(slug: string): Promise<{ slug: string; viewCount: number }> {
    const blogPost = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!blogPost || !blogPost.published || blogPost.archived) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }
    const updated = await this.prisma.blogPost.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      select: { slug: true, viewCount: true },
    });
    return updated;
  }

  async incrementProductClickBySlug(slug: string): Promise<{ ok: boolean }> {
    const updated = await this.prisma.blogPost.updateMany({
      where: {
        slug,
        published: true,
        archived: false,
      },
      data: { productClickCount: { increment: 1 } },
    });
    return { ok: updated.count > 0 };
  }

  async publish(id: string): Promise<BlogPostResponseDto> {
    await this.findOne(id);
    const blogPost = await this.prisma.blogPost.update({
      where: { id },
      data: {
        published: true,
        archived: false,
        publishedAt: new Date(),
      },
    });
    return this.formatResponse(blogPost);
  }

  async archive(id: string): Promise<BlogPostResponseDto> {
    await this.findOne(id);
    const blogPost = await this.prisma.blogPost.update({
      where: { id },
      data: {
        archived: true,
        published: false,
        publishedAt: null,
      },
    });
    return this.formatResponse(blogPost);
  }

  async scoreSeo(id: string): Promise<BlogPostResponseDto> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }
    const score = this.seoScoring.scoreBlogPost({
      title: existing.title,
      seoTitle: existing.seoTitle,
      seoDescription: existing.seoDescription,
      excerpt: existing.excerpt,
      content: existing.content,
      targetKeyword: existing.targetKeyword,
      seoKeywords: existing.seoKeywords,
      keywordIntent: existing.keywordIntent,
    });
    const blogPost = await this.prisma.blogPost.update({
      where: { id },
      data: { seoScore: score },
    });
    return this.formatResponse(blogPost);
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPostResponseDto> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }

    if (dto.slug) {
      const slugOwner = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });

      if (slugOwner && slugOwner.id !== id) {
        throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
      }
    }

    const data: Record<string, unknown> = { ...dto };

    if (dto.faq !== undefined) {
      data.faq = dto.faq?.length ? (dto.faq as unknown as Prisma.InputJsonValue) : null;
    }
    if (dto.internalLinks !== undefined) {
      data.internalLinks = dto.internalLinks?.length
        ? (dto.internalLinks as Prisma.InputJsonValue)
        : null;
    }
    if (dto.recommendedProductIds !== undefined) {
      data.recommendedProductIds = dto.recommendedProductIds?.length
        ? (dto.recommendedProductIds as Prisma.InputJsonValue)
        : null;
    }

    if (dto.published === true && !existing.published) {
      data.publishedAt = new Date();
    } else if (dto.published === false) {
      data.publishedAt = null;
    }

    const blogPost = await this.prisma.blogPost.update({
      where: { id },
      data: data as Prisma.BlogPostUpdateInput,
    });

    return this.formatResponse(blogPost);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.blogPost.delete({
      where: { id },
    });
  }

  async getCategories(onlyPublished = false): Promise<string[]> {
    const results = await this.prisma.blogPost.findMany({
      where: onlyPublished
        ? {
            published: true,
            archived: false,
          }
        : undefined,
      distinct: ['category'],
      select: { category: true },
    });

    return results.map((r) => r.category).sort();
  }

  async getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPostResponseDto[]> {
    const post = await this.findOne(postId);

    const relatedPosts = await this.prisma.blogPost.findMany({
      where: {
        AND: [
          { id: { not: postId } },
          { category: post.category },
          { published: true },
          { archived: false },
        ],
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return relatedPosts.map((p) => this.formatResponse(p));
  }

  private displayStatus(p: { published: boolean; archived: boolean }): BlogDisplayStatus {
    if (p.archived) return 'ARCHIVED';
    if (p.published) return 'PUBLISHED';
    return 'DRAFT';
  }

  private parseStringArray(raw: unknown): string[] | null {
    if (raw == null) return null;
    if (!Array.isArray(raw)) return null;
    return raw.every((x) => typeof x === 'string') ? (raw as string[]) : null;
  }

  private parseFaq(raw: unknown): Array<{ question: string; answer: string }> | null {
    if (raw == null) return null;
    if (!Array.isArray(raw)) return null;
    const out: Array<{ question: string; answer: string }> = [];
    for (const row of raw) {
      if (
        row &&
        typeof row === 'object' &&
        'question' in row &&
        'answer' in row &&
        typeof (row as any).question === 'string' &&
        typeof (row as any).answer === 'string'
      ) {
        out.push({
          question: (row as any).question,
          answer: (row as any).answer,
        });
      }
    }
    return out.length ? out : null;
  }

  private formatResponse(blogPost: any): BlogPostResponseDto {
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
      seoScore: blogPost.seoScore,
      targetKeyword: blogPost.targetKeyword,
      keywordIntent: blogPost.keywordIntent,
      viewCount: blogPost.viewCount ?? 0,
      productClickCount: blogPost.productClickCount ?? 0,
      archived: blogPost.archived ?? false,
      aiGenerated: blogPost.aiGenerated ?? false,
      promptVersionId: blogPost.promptVersionId ?? null,
      lastGenerationError: blogPost.lastGenerationError ?? null,
      faq: this.parseFaq(blogPost.faq),
      internalLinks: this.parseStringArray(blogPost.internalLinks),
      recommendedProductIds: this.parseStringArray(blogPost.recommendedProductIds),
      status: this.displayStatus({
        published: blogPost.published,
        archived: blogPost.archived ?? false,
      }),
    };
  }
}
