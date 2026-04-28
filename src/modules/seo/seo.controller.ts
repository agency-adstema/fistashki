import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { GenerateBlogDraftDto } from './dto/generate-blog-draft.dto';
import { CreateSeoKeywordDto, UpdateSeoKeywordDto } from './dto/seo-keyword.dto';
import { SeoKeywordQueryDto } from './dto/seo-keyword-query.dto';
import { CreateSeoPromptVersionDto, UpdateSeoPromptVersionDto } from './dto/seo-prompt.dto';
import { GenerateFromKeywordBodyDto } from './dto/generate-from-keyword.dto';
import { SeoAiService } from './services/seo-ai.service';
import { SeoKeywordsService } from './services/seo-keywords.service';
import { SeoDashboardService } from './services/seo-dashboard.service';
import { SeoPromptService } from './services/seo-prompt.service';
import { SeoKeywordStatus } from '@prisma/client';

@ApiTags('SEO Blog / CMS')
@Controller('seo')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class SeoController {
  constructor(
    private readonly ai: SeoAiService,
    private readonly keywords: SeoKeywordsService,
    private readonly dashboard: SeoDashboardService,
    private readonly prompts: SeoPromptService,
  ) {}

  // ---- Dashboard (also used by “SEO Dashboard” tab) ----

  @Get('dashboard')
  @Permissions('blog.read')
  @ApiOperation({ summary: 'SEO dashboard metrics for Blog / CMS' })
  async getDashboard() {
    const data = await this.dashboard.getSummary();
    return { message: 'SEO dashboard', data };
  }

  // ---- AI draft generation ----

  @Post('generate-draft')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Generate a blog post draft with AI (not published)' })
  async generateDraft(@Body() dto: GenerateBlogDraftDto) {
    const data = await this.ai.generateDraft(dto);
    return { message: data.message, data };
  }

  // ---- Keywords ----

  @Get('keywords')
  @Permissions('blog.read')
  @ApiOperation({ summary: 'List SEO keywords (filters for Keywords tab)' })
  async listKeywords(@Query() q: SeoKeywordQueryDto) {
    const data = await this.keywords.findAll(q.page, q.limit, q.status);
    return { message: 'SEO keywords', data };
  }

  @Post('keywords')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Add a keyword' })
  async createKeyword(@Body() dto: CreateSeoKeywordDto) {
    const data = await this.keywords.create(dto);
    return { message: 'Keyword created', data };
  }

  @Get('keywords/:id')
  @Permissions('blog.read')
  @ApiOperation({ summary: 'Get one keyword' })
  async getKeyword(@Param('id') id: string) {
    const data = await this.keywords.findOne(id);
    return { message: 'SEO keyword', data };
  }

  @Patch('keywords/:id')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Update keyword (including approve/reject via status)' })
  async patchKeyword(@Param('id') id: string, @Body() dto: UpdateSeoKeywordDto) {
    const data = await this.keywords.update(id, dto);
    return { message: 'Keyword updated', data };
  }

  @Post('keywords/:id/approve')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Approve keyword' })
  async approveKeyword(@Param('id') id: string) {
    const data = await this.keywords.setStatus(id, SeoKeywordStatus.APPROVED);
    return { message: 'Keyword approved', data };
  }

  @Post('keywords/:id/reject')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Reject keyword' })
  async rejectKeyword(@Param('id') id: string) {
    const data = await this.keywords.setStatus(id, SeoKeywordStatus.REJECTED);
    return { message: 'Keyword rejected', data };
  }

  @Post('keywords/:id/generate-article')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Generate draft article from an approved keyword' })
  async generateFromKeyword(
    @Param('id') id: string,
    @Body() body: GenerateFromKeywordBodyDto,
  ) {
    const data = await this.ai.generateFromKeyword(id, body.articleLengthWords ?? 800);
    return { message: 'Article draft generated from keyword', data };
  }

  @Delete('keywords/:id')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Delete keyword' })
  async deleteKeyword(@Param('id') id: string) {
    await this.keywords.remove(id);
    return { message: 'Keyword deleted' };
  }

  // ---- Prompt versions ----

  @Get('prompt-versions')
  @Permissions('blog.read')
  @ApiOperation({ summary: 'List SEO AI prompt versions' })
  async listPrompts() {
    const data = await this.prompts.findAll();
    return { message: 'Prompt versions', data };
  }

  @Post('prompt-versions')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Create prompt version' })
  async createPrompt(@Body() dto: CreateSeoPromptVersionDto) {
    const data = await this.prompts.create(dto);
    return { message: 'Prompt version created', data };
  }

  @Patch('prompt-versions/:id')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Update prompt version' })
  async updatePrompt(@Param('id') id: string, @Body() dto: UpdateSeoPromptVersionDto) {
    const data = await this.prompts.update(id, dto);
    return { message: 'Prompt version updated', data };
  }

  @Post('prompt-versions/:id/activate')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Activate prompt version (deactivates others)' })
  async activatePrompt(@Param('id') id: string) {
    const data = await this.prompts.activate(id);
    return { message: 'Prompt version activated', data };
  }

  @Delete('prompt-versions/:id')
  @Permissions('blog.manage')
  @ApiOperation({ summary: 'Delete unused prompt version' })
  async deletePrompt(@Param('id') id: string) {
    const data = await this.prompts.remove(id);
    return { message: 'Prompt version deleted', data };
  }
}
