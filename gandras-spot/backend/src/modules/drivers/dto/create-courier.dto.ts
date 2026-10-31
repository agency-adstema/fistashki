import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourierDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ description: 'Isplata po dostavi (RSD); prazno = podrazumevano iz podešavanja' })
  @IsOptional()
  @IsInt()
  @Min(0)
  payPerDelivery?: number;
}
