import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CouponsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CouponType })
  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
