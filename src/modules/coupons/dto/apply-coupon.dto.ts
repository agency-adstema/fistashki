import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty({ description: 'Coupon code to apply' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Customer ID used to enforce perUserLimit' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
