import { IsString, IsEmail, IsPhoneNumber, IsNumber, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNetworkOrderDto {
  @ApiProperty({ example: 'external-order-123', description: 'Unique order ID from network' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ example: 'john@example.com', description: 'Customer email' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: '+381600000001', description: 'Customer phone number' })
  @IsPhoneNumber()
  customerPhone: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: [
      { sku: 'KREMA-001', name: 'Anti-aging Cream', quantity: 2, price: 2500 },
      { sku: 'CAJU-002', name: 'Herbal Tea', quantity: 1, price: 1500 },
    ],
    description: 'Array of ordered items with SKU, name, quantity, and price',
  })
  @IsArray()
  @IsNotEmpty()
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number;
  }>;

  @ApiProperty({ example: 6500, description: 'Total order amount' })
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({ example: 'RSD', default: 'RSD', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Special instructions for this order' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'https://network.com/confirm/12345' })
  @IsString()
  @IsOptional()
  confirmationUrl?: string;

  @ApiPropertyOptional({ example: 'https://network.com/webhook/orders' })
  @IsString()
  @IsOptional()
  webhookUrl?: string;
}

export class ConfirmNetworkOrderDto {
  @ApiProperty({ example: 'CONFIRMED', description: 'Order confirmation status' })
  @IsString()
  @IsNotEmpty()
  status: 'CONFIRMED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Order confirmed and added to queue' })
  @IsString()
  @IsOptional()
  message?: string;
}

export class NetworkOrderResponseDto {
  id: string;
  externalId: string;
  status: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  confirmedAt?: Date;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
  };
}
