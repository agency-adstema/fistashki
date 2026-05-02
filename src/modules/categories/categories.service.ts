import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  expandPublicCategorySlugVariants,
  isUuidLike,
} from '../../common/utils/category-slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /** Isto kao ProductsService — apsolutan URL za /uploads u shopu. */
  private resolvePublicAssetUrl(url: string | null | undefined): string | null | undefined {
    if (url == null || url === '') return url;
    if (url.startsWith('data:')) return url;
    const base = (process.env.PUBLIC_ASSET_BASE_URL || '').replace(/\/$/, '');
    if (!base) return url;
    if (url.startsWith('/uploads/')) {
      return `${base}${url}`;
    }
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      try {
        const u = new URL(url);
        return `${base}${u.pathname}${u.search}${u.hash}`;
      } catch {
        return url;
      }
    }
    return url;
  }

  async create(dto: CreateCategoryDto, actorUserId?: string) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Category slug already exists');

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        image: dto.image,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'categories.create',
      entityType: 'Category',
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    return category;
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { productCategories: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { productCategories: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, actorUserId?: string) {
    await this.findOne(id);

    if (dto.slug !== undefined && dto.slug !== null) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category slug already exists');
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
      },
      include: {
        parent: true,
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { productCategories: true } },
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'categories.update',
      entityType: 'Category',
      entityId: category.id,
      metadata: { changes: dto },
    });

    return category;
  }

  async remove(id: string, actorUserId?: string) {
    const category = await this.findOne(id);

    if (category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete a category that has child categories. Remove or reassign children first.',
      );
    }

    await this.prisma.category.delete({ where: { id } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'categories.delete',
      entityType: 'Category',
      entityId: id,
      metadata: { name: category.name, slug: category.slug },
    });

    return { id };
  }

  /** Samo glavne kategorije za meni/footer — bez slika/dece, mali JSON. */
  async findPublicCategoriesNav() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      select: { name: true, slug: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return { items: categories };
  }

  async findPublicCategories() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { productCategories: true } },
          },
        },
        _count: { select: { productCategories: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      items: categories.map((c) => this.formatPublicCategory(c)),
    };
  }

  async findPublicCategory(idOrSlug: string) {
    const key = (idOrSlug || '').trim();
    if (!key) throw new NotFoundException('Category not found');

    const slugVariants = expandPublicCategorySlugVariants(key);
    const whereClause = isUuidLike(key)
      ? { id: key, isActive: true }
      : {
          isActive: true,
          OR: slugVariants.map((slug) => ({
            slug: { equals: slug, mode: 'insensitive' as const },
          })),
        };

    const category = await this.prisma.category.findFirst({
      where: whereClause,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { productCategories: true } },
          },
        },
        _count: { select: { productCategories: true } },
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return this.formatPublicCategory(category);
  }

  private formatPublicCategory(category: any): any {
    const image = this.resolvePublicAssetUrl(category.image) ?? category.image ?? null;
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      seoTitle: category.seoTitle ?? null,
      seoDescription: category.seoDescription ?? null,
      productCount: category._count?.productCategories ?? 0,
      children:
        category.children && category.children.length > 0
          ? category.children.map((child: any) => this.formatPublicCategory(child))
          : [],
    };
  }
}
