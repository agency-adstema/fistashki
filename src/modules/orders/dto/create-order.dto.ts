import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID to add to the order' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity to order', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID of the customer placing the order' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: 'ID of the shipping address (must belong to the customer)' })
  @IsOptional()
  @IsString()
  shippingAddressId?: string;

  @ApiProperty({ type: [OrderItemDto], description: 'Order line items (minimum 1)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Internal or customer-facing order notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Shipping cost (default 0)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingTotal?: number;

  @ApiPropertyOptional({ description: 'Discount amount applied to the order (default 0)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountTotal?: number;

  @ApiPropertyOptional({ description: 'Currency code (default RSD)', default: 'RSD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;
}
