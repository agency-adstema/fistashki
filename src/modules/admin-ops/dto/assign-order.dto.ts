import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignOrderDto {
  @ApiProperty({ description: 'ID of the admin user to assign this order to' })
  @IsString()
  userId: string;
}
