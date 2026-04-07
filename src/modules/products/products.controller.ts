import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions('products.create')
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    const data = await this.productsService.create(dto, user?.id);
    return { message: 'Product created successfully', data };
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get all products (paginated)' })
  async findAll(@Query() query: ProductsQueryDto) {
    const { status, ...pagination } = query;
    const data = await this.productsService.findAll(pagination, status);
    return { message: 'Products fetched successfully', data };
  }

  @Get(':id')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id);
    return { message: 'Product fetched successfully', data };
  }

  @Patch(':id')
  @Permissions('products.update')
  @ApiOperation({ summary: 'Update a product' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.productsService.update(id, dto, user?.id);
    return { message: 'Product updated successfully', data };
  }

  @Delete(':id')
  @Permissions('products.delete')
  @ApiOperation({ summary: 'Delete a product' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.productsService.remove(id, user?.id);
    return { message: 'Product deleted successfully', data };
  }
}
