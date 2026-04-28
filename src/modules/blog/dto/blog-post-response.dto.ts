import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KeywordIntent } from '@prisma/client';

export type BlogDisplayStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export class BlogPostResponseDto {
  @ApiProperty({ example: 'clx1a2b3c4d5e6f7g8h9' })
  id: string;

  @ApiProperty({ example: 'Introduction to Organic Gardening' })
  title: string;

  @ApiProperty({ example: 'intro-organic-gardening' })
  slug: string;

  @ApiProperty({
    example: 'Learn the basics of sustainable gardening without chemicals',
  })
  excerpt: string;

  @ApiProperty({ example: '# Title\n\nContent here...' })
  content: string;

  @ApiPropertyOptional({
    example: 'https://api.adstema.com/uploads/blog-image.jpg',
  })
  featuredImage?: string;

  @ApiProperty({ example: 'Gardening Tips' })
  category: string;

  @ApiProperty({ example: 'John Doe' })
  author: string;

  @ApiProperty({ example: 5 })
  readTime: number;

  @ApiPropertyOptional({ example: 'Organic Gardening for Beginners - Tips & Guide' })
  seoTitle?: string;

  @ApiPropertyOptional({
    example: 'Learn how to start organic gardening without chemicals.',
  })
  seoDescription?: string;

  @ApiPropertyOptional({
    example: 'organic gardening, sustainable farming, gardening tips',
  })
  seoKeywords?: string;

  @ApiPropertyOptional({
    example: 'https://api.adstema.com/uploads/og-image.jpg',
  })
  ogImage?: string;

  @ApiPropertyOptional({ example: 'Organic Gardening Guide' })
  ogTitle?: string;

  @ApiPropertyOptional({ example: 'Learn organic gardening basics' })
  ogDescription?: string;

  @ApiProperty({ example: true })
  published: boolean;

  @ApiPropertyOptional({ example: '2026-04-27T12:00:00Z' })
  publishedAt?: Date;

  @ApiProperty({ example: '2026-04-27T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-27T12:00:00Z' })
  updatedAt: Date;

  // --- SEO / analytics (Blog Management table + editor) ---

  @ApiPropertyOptional({ example: 72 })
  seoScore?: number | null;

  @ApiPropertyOptional({ example: 'organic soil' })
  targetKeyword?: string | null;

  @ApiPropertyOptional({ enum: KeywordIntent })
  keywordIntent?: KeywordIntent | null;

  @ApiProperty({ example: 1204 })
  viewCount: number;

  @ApiProperty({ example: 42 })
  productClickCount: number;

  @ApiProperty({ example: false })
  archived: boolean;

  @ApiProperty({ example: false })
  aiGenerated: boolean;

  @ApiPropertyOptional()
  promptVersionId?: string | null;

  @ApiPropertyOptional()
  lastGenerationError?: string | null;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  faq?: Array<{ question: string; answer: string }> | null;

  @ApiPropertyOptional({ type: [String] })
  internalLinks?: string[] | null;

  @ApiPropertyOptional({ type: [String] })
  recommendedProductIds?: string[] | null;

  @ApiProperty({
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    description: 'Derived from published + archived',
  })
  status: BlogDisplayStatus;
}

export class BlogPostListResponseDto {
  @ApiProperty({ type: [BlogPostResponseDto] })
  items: BlogPostResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  pages: number;
}
