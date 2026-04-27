import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { BlogPostResponseDto, BlogPostListResponseDto } from './dto/blog-post-response.dto';
export declare class BlogService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateBlogPostDto): Promise<BlogPostResponseDto>;
    findAll(query: BlogPostQueryDto): Promise<BlogPostListResponseDto>;
    findOne(id: string): Promise<BlogPostResponseDto>;
    findBySlug(slug: string): Promise<BlogPostResponseDto>;
    update(id: string, dto: UpdateBlogPostDto): Promise<BlogPostResponseDto>;
    delete(id: string): Promise<void>;
    getCategories(): Promise<string[]>;
    getRelatedPosts(postId: string, limit?: number): Promise<BlogPostResponseDto[]>;
    private formatResponse;
}
