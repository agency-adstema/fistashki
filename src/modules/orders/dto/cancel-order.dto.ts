import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiPropertyOptional({ description: 'Reason for cancelling the order' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;
}
