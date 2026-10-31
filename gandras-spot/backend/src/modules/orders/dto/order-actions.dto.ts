import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class AcceptOrderDto {
  @ApiProperty({ enum: [5, 10, 15, 20, 25, 30, 40, 60] })
  @IsInt()
  @IsIn([5, 10, 15, 20, 25, 30, 40, 60])
  estimatedMinutes!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNote?: string;
}

export class RejectOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  driverId?: string;
}
