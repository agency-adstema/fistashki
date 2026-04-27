import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BlogPostQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'Gardening Tips',
  })
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Only published posts',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  published?: boolean;

  @ApiPropertyOptional({
    description: 'Search in title and excerpt',
    example: 'organic',
  })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field (createdAt, publishedAt, title)',
    example: 'createdAt',
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order (asc, desc)',
    example: 'desc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
