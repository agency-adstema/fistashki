import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemInput {
  @ApiProperty({ description: 'OrderItem ID to return' })
  @IsString()
  orderItemId: string;

  @ApiProperty({ description: 'Quantity to return', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Reason for returning this specific item' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CreateReturnDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'Customer ID if applicable' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: 'General reason for the return' })
  @IsString()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({ type: [ReturnItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemInput)
  @ArrayMinSize(1)
  items: ReturnItemInput[];
}
