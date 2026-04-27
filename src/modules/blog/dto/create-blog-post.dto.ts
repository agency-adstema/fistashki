import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateBlogPostDto {
  @ApiProperty({
    description: 'Blog post title',
    example: 'Introduction to Organic Gardening',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'intro-organic-gardening',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug: string;

  @ApiProperty({
    description: 'Brief excerpt/summary',
    example: 'Learn the basics of sustainable gardening without chemicals',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({
    description: 'Full blog post content in markdown or HTML',
    example: '# Title\n\nContent here...',
  })
  @IsString()
  @MinLength(50)
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
  @MinLength(2)
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: 'Author name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
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
}
