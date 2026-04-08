import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CartStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CartsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CartStatus })
  @IsOptional()
  @IsEnum(CartStatus)
  status?: CartStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}
