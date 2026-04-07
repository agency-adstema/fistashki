import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'store_manager' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'Store Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Manages store operations' })
  @IsString()
  @IsOptional()
  description?: string;
}
