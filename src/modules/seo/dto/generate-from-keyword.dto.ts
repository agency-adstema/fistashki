import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateFromKeywordBodyDto {
  @ApiPropertyOptional({ description: 'Approximate target length in words', default: 800 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(200)
  @Max(8000)
  articleLengthWords?: number = 800;
}
