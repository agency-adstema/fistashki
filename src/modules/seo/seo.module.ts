import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SeoController } from './seo.controller';
import { SeoAiService } from './services/seo-ai.service';
import { SeoKeywordsService } from './services/seo-keywords.service';
import { SeoDashboardService } from './services/seo-dashboard.service';
import { SeoPromptService } from './services/seo-prompt.service';
import { SeoScoringService } from './services/seo-scoring.service';

@Module({
  imports: [PrismaModule],
  controllers: [SeoController],
  providers: [
    SeoScoringService,
    SeoAiService,
    SeoKeywordsService,
    SeoDashboardService,
    SeoPromptService,
  ],
  exports: [SeoScoringService, SeoAiService],
})
export class SeoModule {}
