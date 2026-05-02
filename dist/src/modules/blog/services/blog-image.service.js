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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BlogImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogImageService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../../prisma/prisma.service");
let BlogImageService = BlogImageService_1 = class BlogImageService {
    prisma;
    logger = new common_1.Logger(BlogImageService_1.name);
    apiKey = process.env.OPENAI_API_KEY;
    chatModel = process.env.OPENAI_SEO_MODEL || 'gpt-4o-mini';
    imageModel = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';
    constructor(prisma) {
        this.prisma = prisma;
    }
    publicUrl(subpath) {
        const base = (process.env.PUBLIC_ASSET_BASE_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '');
        return `${base}${subpath}`;
    }
    async ensureBlogUploadDir() {
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'blog');
        if (!(0, fs_1.existsSync)(dir)) {
            await (0, promises_1.mkdir)(dir, { recursive: true });
        }
        return dir;
    }
    async refinePromptWithChat(title, excerpt, category) {
        if (!this.apiKey) {
            throw new common_1.BadRequestException('OPENAI_API_KEY is not configured.');
        }
        const ctx = [
            `Article title: ${title}`,
            category ? `Category: ${category}` : '',
            excerpt ? `Excerpt: ${excerpt.slice(0, 500)}` : '',
        ]
            .filter(Boolean)
            .join('\n');
        const res = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: this.chatModel,
            messages: [
                {
                    role: 'system',
                    content: 'You write a single English prompt for DALL·E 3: photorealistic editorial hero photo for a gardening / organic lifestyle blog. ' +
                        'Rules: no text, letters, logos, brand names, or watermarks in the image; describe only the scene, lighting, and mood. ' +
                        'Max 320 characters. Output only the prompt text, no quotes.',
                },
                { role: 'user', content: ctx },
            ],
            temperature: 0.65,
            max_tokens: 180,
        }, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        const content = res.data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
            throw new common_1.BadRequestException('Empty prompt refinement from AI');
        }
        return content.trim().replace(/^["']|["']$/g, '').slice(0, 1000);
    }
    fallbackPrompt(title, excerpt) {
        const hint = excerpt?.slice(0, 200).replace(/\s+/g, ' ') || '';
        return (`Photorealistic editorial photograph for a gardening article about: ${title}. ${hint} ` +
            `Natural daylight, organic garden setting, warm tones, shallow depth of field, no text or logos.`).slice(0, 1000);
    }
    async generateOnePng(prompt, size) {
        if (!this.apiKey) {
            throw new common_1.BadRequestException('OPENAI_API_KEY is not configured.');
        }
        let res;
        try {
            res = await axios_1.default.post('https://api.openai.com/v1/images/generations', {
                model: this.imageModel,
                prompt: prompt.slice(0, 4000),
                n: 1,
                size,
                response_format: 'b64_json',
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 120000,
            });
        }
        catch (err) {
            const ax = axios_1.default.isAxiosError(err) ? err : null;
            const msg = ax?.response?.data?.error?.message ||
                (err instanceof Error ? err.message : String(err));
            this.logger.warn(`OpenAI images error: ${msg}`);
            throw new common_1.BadRequestException(`Image generation failed: ${msg}`);
        }
        const b64 = res.data?.data?.[0]?.b64_json;
        if (!b64 || typeof b64 !== 'string') {
            throw new common_1.BadRequestException('Image API returned no image data');
        }
        const dir = await this.ensureBlogUploadDir();
        const filename = `${(0, uuid_1.v4)()}.png`;
        const fullPath = (0, path_1.join)(dir, filename);
        await (0, promises_1.writeFile)(fullPath, Buffer.from(b64, 'base64'));
        return this.publicUrl(`/uploads/blog/${filename}`);
    }
    async generateAndAttachImages(blogPostId, opts) {
        const post = await this.prisma.blogPost.findUnique({ where: { id: blogPostId } });
        if (!post) {
            throw new common_1.NotFoundException(`Blog post ${blogPostId} not found`);
        }
        const refine = opts.refinePrompt !== false;
        let imagePrompt;
        try {
            imagePrompt = refine
                ? await this.refinePromptWithChat(post.title, post.excerpt, post.category)
                : this.fallbackPrompt(post.title, post.excerpt);
        }
        catch (e) {
            this.logger.warn(`Prompt refinement failed, using fallback: ${e}`);
            imagePrompt = this.fallbackPrompt(post.title, post.excerpt);
        }
        const separate = opts.separateFeatured === true;
        let ogUrl;
        let featuredUrl;
        if (separate) {
            ogUrl = await this.generateOnePng(imagePrompt, '1792x1024');
            featuredUrl = await this.generateOnePng(imagePrompt, '1024x1024');
        }
        else {
            const url = await this.generateOnePng(imagePrompt, '1792x1024');
            ogUrl = url;
            featuredUrl = url;
        }
        await this.prisma.blogPost.update({
            where: { id: blogPostId },
            data: {
                featuredImage: featuredUrl,
                ogImage: ogUrl,
            },
        });
        return { featuredImage: featuredUrl, ogImage: ogUrl, imagePromptUsed: imagePrompt };
    }
};
exports.BlogImageService = BlogImageService;
exports.BlogImageService = BlogImageService = BlogImageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogImageService);
//# sourceMappingURL=blog-image.service.js.map