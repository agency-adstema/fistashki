import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from '../products.service';
import {
  PublicProductDto,
  PublicProductDetailDto,
  PublicProductsListResponseDto,
} from '../dto/public-product.dto';

class PublicProductsQueryDto {
  page?: number = 1;
  limit?: number = 20;
  search?: string;
  category?: string;
}

@ApiTags('public-products')
@Controller('public/products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all public products (paginated, searchable, filterable)',
    description: 'Browse products without authentication. Supports pagination, search, and category filtering.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
    description: 'Items per page (max 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by product name or SKU',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category ID (UUID) or slug (npr. djubriva)',
  })
  @ApiResponse({
    status: 200,
    description: 'Products fetched successfully',
    type: PublicProductsListResponseDto,
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ): Promise<PublicProductsListResponseDto> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;

    const data = await this.productsService.findPublicProducts({
      page: pageNum,
      limit: limitNum,
      search,
      categoryId: category,
    });

    return data as PublicProductsListResponseDto;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public product by ID',
    description: 'Retrieve detailed product information including all images and full details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product fetched successfully',
    type: PublicProductDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<PublicProductDetailDto> {
    const data = await this.productsService.findPublicProduct(id);
    return data as PublicProductDetailDto;
  }
}
