import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignShippingMethodDto {
  @ApiProperty()
  @IsString()
  shippingMethodId: string;
}
