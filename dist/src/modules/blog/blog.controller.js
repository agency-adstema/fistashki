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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const blog_service_1 = require("./blog.service");
const blog_image_service_1 = require("./services/blog-image.service");
const seo_ai_service_1 = require("../seo/services/seo-ai.service");
const generate_blog_images_dto_1 = require("./dto/generate-blog-images.dto");
const create_blog_post_dto_1 = require("./dto/create-blog-post.dto");
const update_blog_post_dto_1 = require("./dto/update-blog-post.dto");
const blog_post_query_dto_1 = require("./dto/blog-post-query.dto");
const blog_post_response_dto_1 = require("./dto/blog-post-response.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let BlogController = class BlogController {
    blogService;
    seoAiService;
    blogImageService;
    constructor(blogService, seoAiService, blogImageService) {
        this.blogService = blogService;
        this.seoAiService = seoAiService;
        this.blogImageService = blogImageService;
    }
    async findAllPublished(query) {
        return this.blogService.findAll({
            ...query,
            published: true,
            archived: false,
        });
    }
    async findBySlug(slug) {
        return this.blogService.findBySlug(slug);
    }
    async trackView(slug) {
        const data = await this.blogService.recordView(slug);
        return { message: 'View recorded', data };
    }
    async trackProductClick(slug) {
        const data = await this.blogService.incrementProductClickBySlug(slug);
        return { message: 'Product click recorded', data };
    }
    async getCategories() {
        return this.blogService.getCategories(true);
    }
    async getRelatedPosts(id, limit = '3') {
        return this.blogService.getRelatedPosts(id, parseInt(limit, 10));
    }
    async create(createDto) {
        return this.blogService.create(createDto);
    }
    async findAll(query) {
        return this.blogService.findAll(query);
    }
    async publish(id) {
        const data = await this.blogService.publish(id);
        return { message: 'Blog post published', data };
    }
    async archive(id) {
        const data = await this.blogService.archive(id);
        return { message: 'Blog post archived', data };
    }
    async regenerateAi(id) {
        const data = await this.seoAiService.regeneratePost(id);
        return { message: data.message, data };
    }
    async generateImages(id, body) {
        const data = await this.blogImageService.generateAndAttachImages(id, {
            refinePrompt: body.refinePrompt,
            separateFeatured: body.separateFeatured,
        });
        return { message: 'Images generated and attached', data };
    }
    async scoreSeo(id) {
        const data = await this.blogService.scoreSeo(id);
        return { message: 'SEO score updated', data };
    }
    async findOne(id) {
        return this.blogService.findOne(id);
    }
    async update(id, updateDto) {
        return this.blogService.update(id, updateDto);
    }
    async delete(id) {
        return this.blogService.delete(id);
    }
};
exports.BlogController = BlogController;
__decorate([
    (0, common_1.Get)('posts'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all published blog posts',
        description: 'Retrieve a paginated list of published blog posts with filtering and sorting',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of published blog posts',
        type: blog_post_response_dto_1.BlogPostListResponseDto,
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_post_query_dto_1.BlogPostQueryDto]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "findAllPublished", null);
__decorate([
    (0, common_1.Get)('posts/:slug'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a blog post by slug',
        description: 'Retrieve a published blog post by its URL slug',
    }),
    (0, swagger_1.ApiParam)({
        name: 'slug',
        description: 'Blog post slug (URL-friendly identifier)',
        example: 'intro-organic-gardening',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Blog post detail',
        type: blog_post_response_dto_1.BlogPostResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Blog post not found',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)('posts/:slug/track-view'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Increment public view counter for a published post' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Post slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "trackView", null);
__decorate([
    (0, common_1.Post)('posts/:slug/track-product-click'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Increment product-click counter for analytics' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "trackProductClick", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all blog categories',
        description: 'Retrieve a list of all unique blog post categories',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of blog categories',
        schema: {
            type: 'array',
            items: { type: 'string' },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('posts/:id/related'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get related blog posts',
        description: 'Retrieve related blog posts in the same category',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Blog post ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        example: 3,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of related blog posts',
        type: [blog_post_response_dto_1.BlogPostResponseDto],
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "getRelatedPosts", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new blog post',
        description: 'Create a new blog post with optional SEO metadata. Requires admin permission.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Blog post created successfully',
        type: blog_post_response_dto_1.BlogPostResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Blog post with this slug already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_blog_post_dto_1.CreateBlogPostDto]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.read'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all blog posts',
        description: 'Retrieve all blog posts including drafts (admin only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all blog posts',
        type: blog_post_response_dto_1.BlogPostListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_post_query_dto_1.BlogPostQueryDto]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Publish blog post',
        description: 'Sets published=true, clears archive, stamps publishedAt',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive blog post', description: 'Hides from public list; unpublished' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Regenerate draft body with SEO AI using stored keyword/metadata' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "regenerateAi", null);
__decorate([
    (0, common_1.Post)(':id/generate-images'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate featured + OG images with OpenAI (DALL·E)',
        description: 'Creates images from title/excerpt, saves under /uploads/blog/, sets featuredImage and ogImage. Requires OPENAI_API_KEY; optional OPENAI_IMAGE_MODEL (default dall-e-3).',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_blog_images_dto_1.GenerateBlogImagesDto]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "generateImages", null);
__decorate([
    (0, common_1.Post)(':id/score-seo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Recompute heuristic SEO score' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "scoreSeo", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.read'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a blog post by ID',
        description: 'Retrieve a blog post detail by ID (admin only)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Blog post ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Blog post detail',
        type: blog_post_response_dto_1.BlogPostResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Blog post not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a blog post',
        description: 'Update an existing blog post. Requires admin permission.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Blog post ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Blog post updated successfully',
        type: blog_post_response_dto_1.BlogPostResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Blog post not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Blog post with this slug already exists',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_blog_post_dto_1.UpdateBlogPostDto]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.Permissions)('blog.manage'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a blog post',
        description: 'Delete a blog post by ID. Requires admin permission.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Blog post ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Blog post deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Blog post not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "delete", null);
exports.BlogController = BlogController = __decorate([
    (0, swagger_1.ApiTags)('Blog'),
    (0, common_1.Controller)('blog'),
    __metadata("design:paramtypes", [blog_service_1.BlogService,
        seo_ai_service_1.SeoAiService,
        blog_image_service_1.BlogImageService])
], BlogController);
//# sourceMappingURL=blog.controller.js.map