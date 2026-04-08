import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Unique key identifier for the tag (e.g. "vip", "urgent")' })
  @IsString()
  @MaxLength(100)
  key: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Hex color or CSS color string' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;
}
