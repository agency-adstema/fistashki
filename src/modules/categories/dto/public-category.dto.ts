import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicCategoryDto {
  @ApiProperty({ example: 'clc123456789abcdefghijklmn' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiPropertyOptional({ example: 'All electronic items' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://api.example.com/uploads/categories/cat.jpg' })
  image?: string | null;

  @ApiPropertyOptional({ example: 'clc0987654321abcdefghijklmn' })
  parentId?: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'Electronics - Shop Now | Store' })
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Browse our wide selection of electronics' })
  seoDescription?: string;

  @ApiPropertyOptional({ type: [PublicCategoryDto] })
  children?: PublicCategoryDto[];

  @ApiProperty({ example: 10, description: 'Number of products in this category' })
  productCount: number;
}

export class PublicCategoriesListResponseDto {
  @ApiProperty({ type: [PublicCategoryDto] })
  items: PublicCategoryDto[];
}
