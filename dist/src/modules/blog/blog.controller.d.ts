import { BlogService } from './blog.service';
import { BlogImageService } from './services/blog-image.service';
import { SeoAiService } from '../seo/services/seo-ai.service';
import { GenerateBlogImagesDto } from './dto/generate-blog-images.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { BlogPostResponseDto, BlogPostListResponseDto } from './dto/blog-post-response.dto';
export declare class BlogController {
    private readonly blogService;
    private readonly seoAiService;
    private readonly blogImageService;
    constructor(blogService: BlogService, seoAiService: SeoAiService, blogImageService: BlogImageService);
    findAllPublished(query: BlogPostQueryDto): Promise<BlogPostListResponseDto>;
    findBySlug(slug: string): Promise<BlogPostResponseDto>;
    trackView(slug: string): Promise<{
        message: string;
        data: {
            slug: string;
            viewCount: number;
        };
    }>;
    trackProductClick(slug: string): Promise<{
        message: string;
        data: {
            ok: boolean;
        };
    }>;
    getCategories(): Promise<string[]>;
    getRelatedPosts(id: string, limit?: string): Promise<BlogPostResponseDto[]>;
    create(createDto: CreateBlogPostDto): Promise<BlogPostResponseDto>;
    findAll(query: BlogPostQueryDto): Promise<BlogPostListResponseDto>;
    publish(id: string): Promise<{
        message: string;
        data: BlogPostResponseDto;
    }>;
    archive(id: string): Promise<{
        message: string;
        data: BlogPostResponseDto;
    }>;
    regenerateAi(id: string): Promise<{
        message: string;
        data: {
            blogPostId: string;
            message: string;
        };
    }>;
    generateImages(id: string, body: GenerateBlogImagesDto): Promise<{
        message: string;
        data: {
            featuredImage: string;
            ogImage: string;
            imagePromptUsed: string;
        };
    }>;
    scoreSeo(id: string): Promise<{
        message: string;
        data: BlogPostResponseDto;
    }>;
    findOne(id: string): Promise<BlogPostResponseDto>;
    update(id: string, updateDto: UpdateBlogPostDto): Promise<BlogPostResponseDto>;
    delete(id: string): Promise<void>;
}
