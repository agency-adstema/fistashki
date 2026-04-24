import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @MinLength(1)
  key: string;

  @IsString()
  @MinLength(1)
  value: string;

  @IsString()
  @IsOptional()
  description?: string;
}
