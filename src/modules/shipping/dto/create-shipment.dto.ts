import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'ShippingMethod ID to associate with this shipment' })
  @IsOptional()
  @IsString()
  shippingMethodId?: string;

  @ApiPropertyOptional({ description: 'Courier company name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  courier?: string;

  @ApiPropertyOptional({ description: 'Courier service name/level' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  service?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  trackingNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Arbitrary shipment metadata (JSON)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
