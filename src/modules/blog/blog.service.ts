import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { BlogPostResponseDto, BlogPostListResponseDto } from './dto/blog-post-response.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBlogPostDto): Promise<BlogPostResponseDto> {
    const slug = dto.slug?.trim() || dto.title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    // Public list only shows published; default true so admin-created posts appear unless explicitly draft.
    const published = dto.published ?? true;

    // Check if slug already exists
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Blog post with slug "${slug}" already exists`);
    }

    const blogPost = await this.prisma.blogPost.create({
      data: {
        ...dto,
        slug,
        published,
        excerpt: dto.excerpt?.trim() || dto.content.slice(0, 160) || dto.title,
        featuredImage: dto.featuredImage?.trim() || null,
        seoTitle: dto.seoTitle?.trim() || null,
        seoDescription: dto.seoDescription?.trim() || null,
        seoKeywords: dto.seoKeywords?.trim() || null,
        ogImage: dto.ogImage?.trim() || null,
        ogTitle: dto.ogTitle?.trim() || null,
        ogDescription: dto.ogDescription?.trim() || null,
        readTime: dto.readTime || 5,
        publishedAt: published ? new Date() : null,
      },
    });

    return this.formatResponse(blogPost);
  }

  async findAll(query: BlogPostQueryDto): Promise<BlogPostListResponseDto> {
    const { page = 1, limit = 10, category, published, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

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

    return this.formatResponse(blogPost);
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPostResponseDto> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }

    // If slug is being changed, check for conflicts
    if (dto.slug) {
      const slugOwner = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });

      if (slugOwner && slugOwner.id !== id) {
        throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
      }
    }

    const data: Record<string, unknown> = { ...dto };

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
      where: onlyPublished ? { published: true } : undefined,
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
        ],
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    return relatedPosts.map(this.formatResponse);
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
    };
  }
}
