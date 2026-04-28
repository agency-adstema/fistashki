import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateSeoPromptVersionDto {
  @ApiProperty({ example: 'v2 — product-led' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label: string;

  @ApiProperty({ description: 'System instructions for SEO blog generation' })
  @IsString()
  @MinLength(10)
  systemPrompt: string;

  @ApiProperty({
    description:
      'User message template with placeholders {{targetKeyword}}, {{keywordIntent}}, {{category}}, {{relatedProducts}}, {{articleLength}}, {{internalLinksHint}}',
  })
  @IsString()
  @MinLength(20)
  userTemplate: string;
}

export class UpdateSeoPromptVersionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userTemplate?: string;

  @ApiPropertyOptional({
    description: 'Set true to deactivate others and use this prompt for new AI drafts',
  })
  @IsOptional()
  isActive?: boolean;
}
