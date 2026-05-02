import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum CommerceContentType {
  CATEGORY_MONEY_PAGE = 'CATEGORY_MONEY_PAGE',
  PRODUCT = 'PRODUCT',
  BLOG = 'BLOG',
  FAQ_ONLY = 'FAQ_ONLY',
  META_ONLY = 'META_ONLY',
}

export class CommerceSeoProductInputDto {
  @ApiProperty({ example: 'Peloid HUMUS' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Short benefit bullets or one line' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  benefits?: string;

  @ApiPropertyOptional({ example: '1.290 RSD' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  priceDisplay?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;
}

export class GenerateCommerceSeoDto {
  @ApiProperty({ enum: CommerceContentType })
  @IsEnum(CommerceContentType)
  contentType: CommerceContentType;

  @ApiProperty({ example: 'tečno organsko đubrivo' })
  @IsString()
  @MaxLength(200)
  mainKeyword: string;

  @ApiPropertyOptional({ type: [String], example: ['organsko đubrivo za biljke', 'kako koristiti tečno đubrivo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedKeywords?: string[];

  @ApiPropertyOptional({ type: [String], example: ['kupiti tečno đubrivo', 'najbolje đubrivo za paradajz'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  buyerIntentKeywords?: string[];

  @ApiProperty({ example: 'Tečna organska đubriva' })
  @IsString()
  @MaxLength(200)
  targetCategory: string;

  @ApiPropertyOptional({ description: 'If set, loads active products from this category when products[] is empty' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ type: [CommerceSeoProductInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommerceSeoProductInputDto)
  products?: CommerceSeoProductInputDto[];

  @ApiPropertyOptional({ type: [String], example: ['https://kucabasta.rs/tecno-organsko-djubrivo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internalLinks?: string[];

  @ApiPropertyOptional({ example: 'stručan, topao, prodajno orijentisan' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  toneOfVoice?: string;

  @ApiPropertyOptional({ default: 'sr-Latn' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;

  @ApiPropertyOptional({ example: 'RS' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  country?: string;

  @ApiPropertyOptional({
    description: 'Target length in words (defaults by content type if omitted)',
    minimum: 200,
    maximum: 6000,
  })
  @IsOptional()
  @IsInt()
  @Min(200)
  @Max(6000)
  wordCountTarget?: number;

  @ApiPropertyOptional({
    description: 'Primary CTA placeholder URL or token, e.g. [LINK_TO_CATEGORY]',
    example: '[LINK_TO_CATEGORY]',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ctaTarget?: string;

  @ApiPropertyOptional({ description: 'Extra store / brand constraints' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  brandNotes?: string;

  @ApiPropertyOptional({
    description: 'For FAQ_ONLY: short summary of existing page so FAQ matches context',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contextSummary?: string;

  @ApiPropertyOptional({ description: 'For PRODUCT: which product this page is for' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  primaryProductName?: string;
}
