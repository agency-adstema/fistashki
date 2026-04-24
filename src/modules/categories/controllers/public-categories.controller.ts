import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from '../categories.service';
import {
  PublicCategoryDto,
  PublicCategoriesListResponseDto,
} from '../dto/public-category.dto';

@ApiTags('public-categories')
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all public categories',
    description: 'Retrieve all available categories without authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched successfully',
    type: PublicCategoriesListResponseDto,
  })
  async findAll(): Promise<PublicCategoriesListResponseDto> {
    const data = await this.categoriesService.findPublicCategories();
    return data;
  }

  @Get('nav')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lightweight category list for shop navigation',
    description: 'Top-level categories with name and slug only (CRM source of truth for URLs).',
  })
  async nav() {
    return this.categoriesService.findPublicCategoriesNav();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get public category by ID',
    description: 'Retrieve a specific category with its details and subcategories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
    type: PublicCategoryDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<PublicCategoryDto> {
    const data = await this.categoriesService.findPublicCategory(id);
    return data;
  }
}
