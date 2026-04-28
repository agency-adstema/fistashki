import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { SeoAiService } from '../seo/services/seo-ai.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { BlogPostResponseDto, BlogPostListResponseDto } from './dto/blog-post-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly seoAiService: SeoAiService,
  ) {}

  // ========== PUBLIC ENDPOINTS ==========

  /**
   * Get all published blog posts (public)
   */
  @Get('posts')
  @ApiOperation({
    summary: 'Get all published blog posts',
    description: 'Retrieve a paginated list of published blog posts with filtering and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published blog posts',
    type: BlogPostListResponseDto,
  })
  async findAllPublished(@Query() query: BlogPostQueryDto): Promise<BlogPostListResponseDto> {
    return this.blogService.findAll({
      ...query,
      published: true,
      archived: false,
    });
  }

  /**
   * Get a blog post by slug (public)
   */
  @Get('posts/:slug')
  @ApiOperation({
    summary: 'Get a blog post by slug',
    description: 'Retrieve a published blog post by its URL slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Blog post slug (URL-friendly identifier)',
    example: 'intro-organic-gardening',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post detail',
    type: BlogPostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<BlogPostResponseDto> {
    return this.blogService.findBySlug(slug);
  }

  /**
   * Record a page view for analytics (call from public site; GET post does not increment).
   */
  @Post('posts/:slug/track-view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Increment public view counter for a published post' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  async trackView(@Param('slug') slug: string) {
    const data = await this.blogService.recordView(slug);
    return { message: 'View recorded', data };
  }

  /**
   * Record an outbound product click from the article (conversion tracking).
   */
  @Post('posts/:slug/track-product-click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Increment product-click counter for analytics' })
  async trackProductClick(@Param('slug') slug: string) {
    const data = await this.blogService.incrementProductClickBySlug(slug);
    return { message: 'Product click recorded', data };
  }

  /**
   * Get blog categories (public)
   */
  @Get('categories')
  @ApiOperation({
    summary: 'Get all blog categories',
    description: 'Retrieve a list of all unique blog post categories',
  })
  @ApiResponse({
    status: 200,
    description: 'List of blog categories',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  async getCategories(): Promise<string[]> {
    return this.blogService.getCategories(true);
  }

  /**
   * Get related blog posts (public)
   */
  @Get('posts/:id/related')
  @ApiOperation({
    summary: 'Get related blog posts',
    description: 'Retrieve related blog posts in the same category',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'List of related blog posts',
    type: [BlogPostResponseDto],
  })
  async getRelatedPosts(
    @Param('id') id: string,
    @Query('limit') limit: string = '3',
  ): Promise<BlogPostResponseDto[]> {
    return this.blogService.getRelatedPosts(id, parseInt(limit, 10));
  }

  // ========== PROTECTED ADMIN ENDPOINTS ==========

  /**
   * Create a new blog post (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.manage')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new blog post',
    description: 'Create a new blog post with optional SEO metadata. Requires admin permission.',
  })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
    type: BlogPostResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Blog post with this slug already exists',
  })
  async create(@Body() createDto: CreateBlogPostDto): Promise<BlogPostResponseDto> {
    return this.blogService.create(createDto);
  }

  /**
   * Get all blog posts (admin only, includes unpublished)
   */
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.read')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all blog posts',
    description: 'Retrieve all blog posts including drafts (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all blog posts',
    type: BlogPostListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findAll(@Query() query: BlogPostQueryDto): Promise<BlogPostListResponseDto> {
    return this.blogService.findAll(query);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Publish blog post',
    description: 'Sets published=true, clears archive, stamps publishedAt',
  })
  async publish(@Param('id') id: string): Promise<{ message: string; data: BlogPostResponseDto }> {
    const data = await this.blogService.publish(id);
    return { message: 'Blog post published', data };
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Archive blog post', description: 'Hides from public list; unpublished' })
  async archive(@Param('id') id: string): Promise<{ message: string; data: BlogPostResponseDto }> {
    const data = await this.blogService.archive(id);
    return { message: 'Blog post archived', data };
  }

  @Post(':id/regenerate-ai')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Regenerate draft body with SEO AI using stored keyword/metadata' })
  async regenerateAi(@Param('id') id: string) {
    const data = await this.seoAiService.regeneratePost(id);
    return { message: data.message, data };
  }

  @Post(':id/score-seo')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Recompute heuristic SEO score' })
  async scoreSeo(@Param('id') id: string): Promise<{ message: string; data: BlogPostResponseDto }> {
    const data = await this.blogService.scoreSeo(id);
    return { message: 'SEO score updated', data };
  }

  /**
   * Get a blog post by ID (admin only)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.read')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get a blog post by ID',
    description: 'Retrieve a blog post detail by ID (admin only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post detail',
    type: BlogPostResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async findOne(@Param('id') id: string): Promise<BlogPostResponseDto> {
    return this.blogService.findOne(id);
  }

  /**
   * Update a blog post (admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update a blog post',
    description: 'Update an existing blog post. Requires admin permission.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
    type: BlogPostResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Blog post with this slug already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    return this.blogService.update(id, updateDto);
  }

  /**
   * Delete a blog post (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blog.manage')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a blog post',
    description: 'Delete a blog post by ID. Requires admin permission.',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog post ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Blog post deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return this.blogService.delete(id);
  }
}
