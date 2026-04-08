import { IsOptional, IsString, IsObject, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkPaidDto {
  @ApiPropertyOptional({ description: 'Provider transaction reference ID' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerTransactionId?: string;

  @ApiPropertyOptional({ description: 'Arbitrary provider metadata (JSON)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
