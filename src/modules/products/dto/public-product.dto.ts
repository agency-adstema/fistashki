import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicProductImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  url: string;

  @ApiPropertyOptional({ example: 'Product front view' })
  altText?: string;
}

export class PublicProductCategoryDto {
  @ApiProperty({ example: 'clc123456789abcdefghijklmn' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;
}

export class PublicProductDto {
  @ApiProperty({ example: 'clc123456789abcdefghijklmn' })
  id: string;

  @ApiProperty({ example: 'Wireless Headphones' })
  name: string;

  @ApiPropertyOptional({ example: 'Premium noise-cancelling headphones' })
  description?: string;

  @ApiProperty({ example: 299.99 })
  price: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiPropertyOptional({ type: [PublicProductImageDto] })
  images?: PublicProductImageDto[];

  @ApiProperty({ example: true })
  inStock: boolean;

  @ApiProperty({ example: 50, description: 'Available quantity if tracked' })
  availableQuantity: number;

  @ApiPropertyOptional({ type: PublicProductCategoryDto })
  category?: PublicProductCategoryDto;

  @ApiPropertyOptional({ example: 'https://example.com/featured.jpg' })
  featuredImage?: string;
}

export class PublicProductDetailDto extends PublicProductDto {
  @ApiPropertyOptional({ example: 'WH-1000XM5' })
  sku?: string;

  @ApiPropertyOptional({ example: 'Premium noise-cancelling headphones' })
  shortDescription?: string;

  @ApiPropertyOptional({ example: 349.99 })
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 'Wireless Headphones | My Store' })
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Buy the best wireless headphones online.' })
  seoDescription?: string;

  @ApiPropertyOptional({ type: [PublicProductCategoryDto] })
  categories?: PublicProductCategoryDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PublicProductsListResponseDto {
  @ApiProperty({ type: [PublicProductDto] })
  items: PublicProductDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  pages: number;
}
