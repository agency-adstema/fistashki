import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions('categories.create')
  @ApiOperation({ summary: 'Create a new category' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.categoriesService.create(dto, user?.id);
    return { message: 'Category created successfully', data };
  }

  @Get()
  @Permissions('categories.read')
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { message: 'Categories fetched successfully', data };
  }

  @Get(':id')
  @Permissions('categories.read')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { message: 'Category fetched successfully', data };
  }

  @Patch(':id')
  @Permissions('categories.update')
  @ApiOperation({ summary: 'Update a category' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.categoriesService.update(id, dto, user?.id);
    return { message: 'Category updated successfully', data };
  }

  @Delete(':id')
  @Permissions('categories.delete')
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.categoriesService.remove(id, user?.id);
    return { message: 'Category deleted successfully', data };
  }
}
