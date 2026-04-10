import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  IsArray,
  IsEnum,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class ProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Product front view' })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'wireless-headphones' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'WH-1000XM5' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ example: 'Premium noise-cancelling headphones' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Full product description...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/featured.jpg' })
  @IsUrl({ require_tld: false })
  @IsOptional()
  featuredImage?: string;

  @ApiPropertyOptional({ example: 'Wireless Headphones | My Store' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Buy the best wireless headphones online.' })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiProperty({ example: 299.99, description: 'Selling price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 349.99, description: 'Original price for comparison' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 150.0, description: 'Cost price (admin only)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  costPrice?: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  trackQuantity?: boolean;

  @ApiPropertyOptional({ example: 100, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @ApiPropertyOptional({ type: [String], description: 'Array of category IDs' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];
}
