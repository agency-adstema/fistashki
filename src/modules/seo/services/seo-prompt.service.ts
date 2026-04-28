import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSeoPromptVersionDto, UpdateSeoPromptVersionDto } from '../dto/seo-prompt.dto';

@Injectable()
export class SeoPromptService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.seoPromptVersion.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const v = await this.prisma.seoPromptVersion.findUnique({ where: { id } });
    if (!v) throw new NotFoundException(`Prompt version ${id} not found`);
    return v;
  }

  async create(dto: CreateSeoPromptVersionDto) {
    return this.prisma.seoPromptVersion.create({
      data: {
        label: dto.label.trim(),
        systemPrompt: dto.systemPrompt,
        userTemplate: dto.userTemplate,
        isActive: false,
      },
    });
  }

  async update(id: string, dto: UpdateSeoPromptVersionDto) {
    await this.findOne(id);
    return this.prisma.seoPromptVersion.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.systemPrompt !== undefined ? { systemPrompt: dto.systemPrompt } : {}),
        ...(dto.userTemplate !== undefined ? { userTemplate: dto.userTemplate } : {}),
        ...(dto.isActive === true ? { isActive: true } : {}),
      },
    });
  }

  async activate(id: string) {
    await this.findOne(id);
    await this.prisma.$transaction([
      this.prisma.seoPromptVersion.updateMany({ data: { isActive: false } }),
      this.prisma.seoPromptVersion.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);
    return this.findOne(id);
  }

  async remove(id: string) {
    const v = await this.findOne(id);
    const inUse = await this.prisma.blogPost.count({
      where: { promptVersionId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        'Cannot delete a prompt version that is referenced by blog posts (deactivate instead).',
      );
    }
    await this.prisma.seoPromptVersion.delete({ where: { id } });
    return { id: v.id, deleted: true };
  }
}
