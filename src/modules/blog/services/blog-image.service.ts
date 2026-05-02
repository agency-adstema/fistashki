import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../../prisma/prisma.service';

type ImageSize = '1024x1024' | '1792x1024' | '1024x1792';

@Injectable()
export class BlogImageService {
  private readonly logger = new Logger(BlogImageService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly chatModel = process.env.OPENAI_SEO_MODEL || 'gpt-4o-mini';
  private readonly imageModel = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';

  constructor(private readonly prisma: PrismaService) {}

  private publicUrl(subpath: string): string {
    const base = (
      process.env.PUBLIC_ASSET_BASE_URL || `http://localhost:${process.env.PORT || 4000}`
    ).replace(/\/$/, '');
    return `${base}${subpath}`;
  }

  private async ensureBlogUploadDir(): Promise<string> {
    const dir = join(process.cwd(), 'uploads', 'blog');
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    return dir;
  }

  private async refinePromptWithChat(
    title: string,
    excerpt: string | null,
    category: string | null,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured.');
    }
    const ctx = [
      `Article title: ${title}`,
      category ? `Category: ${category}` : '',
      excerpt ? `Excerpt: ${excerpt.slice(0, 500)}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.chatModel,
        messages: [
          {
            role: 'system',
            content:
              'You write a single English prompt for DALL·E 3: photorealistic editorial hero photo for a gardening / organic lifestyle blog. ' +
              'Rules: no text, letters, logos, brand names, or watermarks in the image; describe only the scene, lighting, and mood. ' +
              'Max 320 characters. Output only the prompt text, no quotes.',
          },
          { role: 'user', content: ctx },
        ],
        temperature: 0.65,
        max_tokens: 180,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const content = res.data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new BadRequestException('Empty prompt refinement from AI');
    }
    return content.trim().replace(/^["']|["']$/g, '').slice(0, 1000);
  }

  private fallbackPrompt(title: string, excerpt: string | null): string {
    const hint = excerpt?.slice(0, 200).replace(/\s+/g, ' ') || '';
    return (
      `Photorealistic editorial photograph for a gardening article about: ${title}. ${hint} ` +
      `Natural daylight, organic garden setting, warm tones, shallow depth of field, no text or logos.`
    ).slice(0, 1000);
  }

  private async generateOnePng(prompt: string, size: ImageSize): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured.');
    }

    let res;
    try {
      res = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: this.imageModel,
          prompt: prompt.slice(0, 4000),
          n: 1,
          size,
          response_format: 'b64_json',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        },
      );
    } catch (err: unknown) {
      const ax = axios.isAxiosError(err) ? err : null;
      const msg =
        ax?.response?.data?.error?.message ||
        (err instanceof Error ? err.message : String(err));
      this.logger.warn(`OpenAI images error: ${msg}`);
      throw new BadRequestException(`Image generation failed: ${msg}`);
    }

    const b64 = res.data?.data?.[0]?.b64_json;
    if (!b64 || typeof b64 !== 'string') {
      throw new BadRequestException('Image API returned no image data');
    }

    const dir = await this.ensureBlogUploadDir();
    const filename = `${uuidv4()}.png`;
    const fullPath = join(dir, filename);
    await writeFile(fullPath, Buffer.from(b64, 'base64'));

    return this.publicUrl(`/uploads/blog/${filename}`);
  }

  async generateAndAttachImages(
    blogPostId: string,
    opts: { refinePrompt?: boolean; separateFeatured?: boolean },
  ): Promise<{ featuredImage: string; ogImage: string; imagePromptUsed: string }> {
    const post = await this.prisma.blogPost.findUnique({ where: { id: blogPostId } });
    if (!post) {
      throw new NotFoundException(`Blog post ${blogPostId} not found`);
    }

    const refine = opts.refinePrompt !== false;
    let imagePrompt: string;
    try {
      imagePrompt = refine
        ? await this.refinePromptWithChat(post.title, post.excerpt, post.category)
        : this.fallbackPrompt(post.title, post.excerpt);
    } catch (e) {
      this.logger.warn(`Prompt refinement failed, using fallback: ${e}`);
      imagePrompt = this.fallbackPrompt(post.title, post.excerpt);
    }

    const separate = opts.separateFeatured === true;

    let ogUrl: string;
    let featuredUrl: string;

    if (separate) {
      ogUrl = await this.generateOnePng(imagePrompt, '1792x1024');
      featuredUrl = await this.generateOnePng(imagePrompt, '1024x1024');
    } else {
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
}
