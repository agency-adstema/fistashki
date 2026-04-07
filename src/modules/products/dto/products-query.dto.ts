import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ProductsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ProductStatus, description: 'Filter by product status' })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
