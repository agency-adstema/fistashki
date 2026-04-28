import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { KeywordIntent, SeoKeywordStatus } from '@prisma/client';

export class CreateSeoKeywordDto {
  @ApiProperty({ description: 'Target keyword phrase' })
  @IsString()
  @MaxLength(200)
  keyword: string;

  @ApiPropertyOptional({ enum: KeywordIntent })
  @IsOptional()
  @IsEnum(KeywordIntent)
  intent?: KeywordIntent;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSeoKeywordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;

  @ApiPropertyOptional({ enum: KeywordIntent })
  @IsOptional()
  @IsEnum(KeywordIntent)
  intent?: KeywordIntent;

  @ApiPropertyOptional({ enum: SeoKeywordStatus })
  @IsOptional()
  @IsEnum(SeoKeywordStatus)
  status?: SeoKeywordStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
