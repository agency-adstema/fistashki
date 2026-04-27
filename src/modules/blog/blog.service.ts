import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { BlogPostResponseDto, BlogPostListResponseDto } from './dto/blog-post-response.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBlogPostDto): Promise<BlogPostResponseDto> {
    // Check if slug already exists
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
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
    // Check if post exists
    await this.findOne(id);

    // If slug is being changed, check for conflicts
    if (dto.slug) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Blog post with slug "${dto.slug}" already exists`);
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

  async delete(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.blogPost.delete({
      where: { id },
    });
  }

  async getCategories(): Promise<string[]> {
    const results = await this.prisma.blogPost.findMany({
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
