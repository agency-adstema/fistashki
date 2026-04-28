import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { KeywordIntent } from '@prisma/client';

export class GenerateBlogDraftDto {
  @ApiProperty({ description: 'Primary keyword to optimize for', example: 'organic fertilizer' })
  @IsString()
  @MaxLength(200)
  targetKeyword: string;

  @ApiProperty({ enum: KeywordIntent, description: 'Search intent' })
  @IsEnum(KeywordIntent)
  keywordIntent: KeywordIntent;

  @ApiProperty({ description: 'Blog category label', example: 'Gardening' })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({ description: 'Product IDs to feature', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedProductIds?: string[];

  @ApiProperty({
    description: 'Target length (approximate word count bucket)',
    example: 800,
    minimum: 200,
    maximum: 8000,
  })
  @IsInt()
  @Min(200)
  @Max(8000)
  articleLengthWords: number;

  @ApiPropertyOptional({ description: 'Specific prompt version id (defaults to active)' })
  @IsOptional()
  @IsString()
  promptVersionId?: string;

  @ApiPropertyOptional({
    description: 'Author attribution for drafts',
    example: 'Marketing Team',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({ description: 'Internal links to weave in', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internalLinksHint?: string[];
}
