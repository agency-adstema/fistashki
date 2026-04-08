import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCustomerDto {
  @ApiProperty()
  @IsString()
  customerId: string;
}
