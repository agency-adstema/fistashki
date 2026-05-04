import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsNumber,
  Min,
  IsInt,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { KeywordIntent } from '@prisma/client';
import { IsBlogFaqList } from '../validators/is-blog-faq-list.validator';

/** Same as admin CMS: Word/Chat „smart quotes“ and ```json fences break JSON.parse. */
function normalizeFaqJsonString(s: string): string {
  return s
    .replace(/^\uFEFF/, '')
    .replace(/\u00A0/g, ' ')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function transformBlogFaqInput(value: unknown): Array<{ question: string; answer: string }> | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value as Array<{ question: string; answer: string }>;
  if (typeof value === 'string') {
    let t = normalizeFaqJsonString(value);
    if (!t) return undefined;
    try {
      let parsed = JSON.parse(t) as unknown;
      if (typeof parsed === 'string') {
        t = normalizeFaqJsonString(parsed);
        parsed = t ? JSON.parse(t) : [];
      }
      return Array.isArray(parsed) ? (parsed as Array<{ question: string; answer: string }>) : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function transformInternalLinksInput(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return (value as unknown[]).filter((x): x is string => typeof x === 'string');
  }
  if (typeof value === 'string') {
    const lines = value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    return lines.length ? lines : undefined;
  }
  return undefined;
}

export class CreateBlogPostDto {
  @ApiProperty({
    description: 'Blog post title',
    example: 'Introduction to Organic Gardening',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'intro-organic-gardening',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug: string;

  @ApiProperty({
    description: 'Brief excerpt/summary',
    example: 'Learn the basics of sustainable gardening without chemicals',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({
    description: 'Full blog post content in markdown or HTML',
    example: '# Title\n\nContent here...',
  })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({
    description: 'Featured image URL',
    example: 'https://api.adstema.com/uploads/blog-image.jpg',
  })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({
    description: 'Blog category',
    example: 'Gardening Tips',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: 'Author name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  author: string;

  @ApiPropertyOptional({
    description: 'Estimated read time in minutes',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  readTime?: number;

  @ApiPropertyOptional({
    description: 'SEO page title',
    example: 'Organic Gardening for Beginners - Tips & Guide',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Learn how to start organic gardening without chemicals. Complete guide for beginners.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO keywords (comma-separated)',
    example: 'organic gardening, sustainable farming, gardening tips',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoKeywords?: string;

  @ApiPropertyOptional({
    description: 'Open Graph image URL',
    example: 'https://api.adstema.com/uploads/og-image.jpg',
  })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiPropertyOptional({
    description: 'Open Graph title',
    example: 'Organic Gardening Guide',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  ogTitle?: string;

  @ApiPropertyOptional({
    description: 'Open Graph description',
    example: 'Learn organic gardening basics',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  ogDescription?: string;

  @ApiPropertyOptional({
    description: 'Publish status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: 'Primary keyword for SEO / AI' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetKeyword?: string;

  @ApiPropertyOptional({ enum: KeywordIntent })
  @IsOptional()
  @IsEnum(KeywordIntent)
  keywordIntent?: KeywordIntent;

  @ApiPropertyOptional({ description: 'SEO score 0–100 (optional; can be computed)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  seoScore?: number;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } } },
    description:
      'Array of { question, answer }. Admin may send a JSON string (textarea); it is parsed before validation.',
  })
  @IsOptional()
  @Transform(({ value }) => transformBlogFaqInput(value))
  @IsBlogFaqList()
  faq?: Array<{ question: string; answer: string }>;

  @ApiPropertyOptional({
    type: [String],
    description: 'Internal URLs (same site). Send string[] or one URL per line in a string.',
  })
  @IsOptional()
  @Transform(({ value }) => transformInternalLinksInput(value))
  @IsArray()
  @IsString({ each: true })
  internalLinks?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Product IDs to highlight' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedProductIds?: string[];
}
