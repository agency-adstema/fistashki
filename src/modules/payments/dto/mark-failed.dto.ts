import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkFailedDto {
  @ApiPropertyOptional({ description: 'Human-readable reason for failure' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureReason?: string;
}
