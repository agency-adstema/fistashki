import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicCategoryDto {
  @ApiProperty({ example: 'clc123456789abcdefghijklmn' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiPropertyOptional({ example: 'All electronic items' })
  description?: string;

  @ApiPropertyOptional({ example: 'clc0987654321abcdefghijklmn' })
  parentId?: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;

  @ApiPropertyOptional({ type: [PublicCategoryDto] })
  children?: PublicCategoryDto[];

  @ApiProperty({ example: 10, description: 'Number of products in this category' })
  productCount: number;
}

export class PublicCategoriesListResponseDto {
  @ApiProperty({ type: [PublicCategoryDto] })
  items: PublicCategoryDto[];
}
