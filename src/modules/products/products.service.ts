import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private computeInStock(trackQuantity: boolean, stockQuantity: number): boolean {
    return !trackQuantity || stockQuantity > 0;
  }

  private formatProduct(product: any) {
    return {
      ...product,
      price: product.price != null ? Number(product.price) : product.price,
      compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : product.compareAtPrice,
      costPrice: product.costPrice != null ? Number(product.costPrice) : product.costPrice,
      inStock: this.computeInStock(product.trackQuantity, product.stockQuantity),
    };
  }

  async create(dto: CreateProductDto, actorUserId?: string) {
    const [slugExists, skuExists] = await Promise.all([
      this.prisma.product.findUnique({ where: { slug: dto.slug } }),
      this.prisma.product.findUnique({ where: { sku: dto.sku } }),
    ]);

    if (slugExists) throw new ConflictException('Product slug already exists');
    if (skuExists) throw new ConflictException('Product SKU already exists');

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const foundCategories = await this.prisma.category.findMany({
        where: { id: { in: dto.categoryIds } },
        select: { id: true },
      });
      if (foundCategories.length !== dto.categoryIds.length) {
        const foundIds = foundCategories.map((c) => c.id);
        const invalid = dto.categoryIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(`Invalid category IDs: ${invalid.join(', ')}`);
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        sku: dto.sku,
        shortDescription: dto.shortDescription,
        description: dto.description,
        status: dto.status ?? ProductStatus.DRAFT,
        isActive: dto.isActive ?? true,
        featuredImage: dto.featuredImage,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        price: new Prisma.Decimal(dto.price),
        compareAtPrice: dto.compareAtPrice != null ? new Prisma.Decimal(dto.compareAtPrice) : undefined,
        // costPrice is stored for admin use only
        costPrice: dto.costPrice != null ? new Prisma.Decimal(dto.costPrice) : undefined,
        currency: dto.currency ?? 'USD',
        trackQuantity: dto.trackQuantity ?? false,
        stockQuantity: dto.stockQuantity ?? 0,
        lowStockThreshold: dto.lowStockThreshold ?? 5,
        images: dto.images && dto.images.length > 0
          ? {
              create: dto.images.map((img) => ({
                url: img.url,
                altText: img.altText,
                sortOrder: img.sortOrder ?? 0,
                isPrimary: img.isPrimary ?? false,
              })),
            }
          : undefined,
        productCategories: dto.categoryIds && dto.categoryIds.length > 0
          ? {
              create: dto.categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategories: { include: { category: true } },
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'products.create',
      entityType: 'Product',
      entityId: product.id,
      metadata: { name: product.name, sku: product.sku, slug: product.slug },
    });

    return this.formatProduct(product);
  }

  async findAll(pagination: PaginationDto, status?: ProductStatus) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          productCategories: { include: { category: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((p) => this.formatProduct(p)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategories: { include: { category: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.formatProduct(product);
  }

  async update(id: string, dto: UpdateProductDto, actorUserId?: string) {
    await this.findOne(id);

    if (dto.slug !== undefined && dto.slug !== null) {
      const existing = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Product slug already exists');
      }
    }

    if (dto.sku !== undefined && dto.sku !== null) {
      const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Product SKU already exists');
      }
    }

    if (dto.categoryIds !== undefined && dto.categoryIds.length > 0) {
      const foundCategories = await this.prisma.category.findMany({
        where: { id: { in: dto.categoryIds } },
        select: { id: true },
      });
      if (foundCategories.length !== dto.categoryIds.length) {
        const foundIds = foundCategories.map((c) => c.id);
        const invalid = dto.categoryIds.filter((cid) => !foundIds.includes(cid));
        throw new BadRequestException(`Invalid category IDs: ${invalid.join(', ')}`);
      }
    }

    const updateData: Prisma.ProductUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.sku !== undefined) updateData.sku = dto.sku;
    if (dto.shortDescription !== undefined) updateData.shortDescription = dto.shortDescription;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.featuredImage !== undefined) updateData.featuredImage = dto.featuredImage;
    if (dto.seoTitle !== undefined) updateData.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) updateData.seoDescription = dto.seoDescription;
    if (dto.price !== undefined) updateData.price = new Prisma.Decimal(dto.price);
    if (dto.compareAtPrice !== undefined) {
      updateData.compareAtPrice = dto.compareAtPrice != null ? new Prisma.Decimal(dto.compareAtPrice) : null;
    }
    // costPrice is stored for admin use only
    if (dto.costPrice !== undefined) {
      updateData.costPrice = dto.costPrice != null ? new Prisma.Decimal(dto.costPrice) : null;
    }
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.trackQuantity !== undefined) updateData.trackQuantity = dto.trackQuantity;
    if (dto.stockQuantity !== undefined) updateData.stockQuantity = dto.stockQuantity;
    if (dto.lowStockThreshold !== undefined) updateData.lowStockThreshold = dto.lowStockThreshold;

    if (dto.images !== undefined) {
      updateData.images = {
        deleteMany: {},
        create: dto.images.map((img) => ({
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder ?? 0,
          isPrimary: img.isPrimary ?? false,
        })),
      };
    }

    if (dto.categoryIds !== undefined) {
      updateData.productCategories = {
        deleteMany: {},
        create: dto.categoryIds.map((categoryId) => ({ categoryId })),
      };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategories: { include: { category: true } },
      },
    });

    await this.auditLogsService.log({
      actorUserId,
      action: 'products.update',
      entityType: 'Product',
      entityId: product.id,
      metadata: { changes: dto },
    });

    return this.formatProduct(product);
  }

  async remove(id: string, actorUserId?: string) {
    const product = await this.findOne(id);

    await this.prisma.product.delete({ where: { id } });

    await this.auditLogsService.log({
      actorUserId,
      action: 'products.delete',
      entityType: 'Product',
      entityId: id,
      metadata: { name: product.name, sku: product.sku },
    });

    return { id };
  }
}
