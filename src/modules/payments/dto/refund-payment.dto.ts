import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiPropertyOptional({
    description:
      'Amount to refund. Omit for full refund. Must be > 0 and ≤ (amount − already refunded).',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
