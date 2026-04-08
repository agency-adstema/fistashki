import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ description: 'Unique coupon code (case-insensitive, stored uppercase)' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ description: 'Percentage (0-100) or fixed amount' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Minimum cart subtotal to apply coupon' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount cap for PERCENTAGE type' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Total redemption limit across all users' })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Maximum redemptions per customer' })
  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'ISO 8601 start date' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ description: 'ISO 8601 expiry date' })
  @IsDateString()
  validTo: string;
}
