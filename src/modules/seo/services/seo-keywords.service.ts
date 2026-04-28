import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSeoKeywordDto, UpdateSeoKeywordDto } from '../dto/seo-keyword.dto';
import { SeoKeywordStatus } from '@prisma/client';

@Injectable()
export class SeoKeywordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSeoKeywordDto) {
    try {
      return await this.prisma.seoKeyword.create({
        data: {
          keyword: dto.keyword.trim(),
          intent: dto.intent,
          notes: dto.notes?.trim(),
        },
      });
    } catch {
      throw new ConflictException(`Keyword "${dto.keyword}" already exists`);
    }
  }

  async findAll(page = 1, limit = 50, status?: SeoKeywordStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.seoKeyword.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.seoKeyword.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.seoKeyword.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`SEO keyword ${id} not found`);
    return row;
  }

  async update(id: string, dto: UpdateSeoKeywordDto) {
    await this.findOne(id);
    try {
      return await this.prisma.seoKeyword.update({
        where: { id },
        data: {
          ...(dto.keyword !== undefined ? { keyword: dto.keyword.trim() } : {}),
          ...(dto.intent !== undefined ? { intent: dto.intent } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        },
      });
    } catch {
      throw new ConflictException('Keyword value already in use');
    }
  }

  async setStatus(id: string, status: SeoKeywordStatus) {
    return this.update(id, { status });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.seoKeyword.delete({ where: { id } });
  }
}
