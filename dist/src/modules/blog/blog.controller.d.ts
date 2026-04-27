import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { BlogPostResponseDto, BlogPostListResponseDto } from './dto/blog-post-response.dto';
export declare class BlogController {
    private readonly blogService;
    constructor(blogService: BlogService);
    findAllPublished(query: BlogPostQueryDto): Promise<BlogPostListResponseDto>;
    findBySlug(slug: string): Promise<BlogPostResponseDto>;
    getCategories(): Promise<string[]>;
    getRelatedPosts(id: string, limit?: string): Promise<BlogPostResponseDto[]>;
    create(createDto: CreateBlogPostDto): Promise<BlogPostResponseDto>;
    findAll(query: BlogPostQueryDto): Promise<BlogPostListResponseDto>;
    findOne(id: string): Promise<BlogPostResponseDto>;
    update(id: string, updateDto: UpdateBlogPostDto): Promise<BlogPostResponseDto>;
    delete(id: string): Promise<void>;
}
