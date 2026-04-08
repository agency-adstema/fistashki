import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity. Send 0 to remove the item.', minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;
}
