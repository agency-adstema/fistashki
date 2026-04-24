import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  value?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
