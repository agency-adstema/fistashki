import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GenerateBlogImagesDto {
  @ApiPropertyOptional({
    description:
      'Use the chat model to turn title/excerpt into a concise English DALL·E prompt (better aesthetic match)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  refinePrompt?: boolean;

  @ApiPropertyOptional({
    description:
      'If true: wide landscape for ogImage and a separate square image for featuredImage (2× image API cost)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  separateFeatured?: boolean;
}
