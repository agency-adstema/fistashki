import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderPriority } from '@prisma/client';

export class SetPriorityDto {
  @ApiProperty({ enum: OrderPriority })
  @IsEnum(OrderPriority)
  priority: OrderPriority;
}
