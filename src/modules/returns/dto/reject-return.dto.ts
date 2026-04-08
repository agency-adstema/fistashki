import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectReturnDto {
  @ApiPropertyOptional({ description: 'Rejection reason / notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
