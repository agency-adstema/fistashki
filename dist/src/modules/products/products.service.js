"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let ProductsService = class ProductsService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    computeInStock(trackQuantity, stockQuantity) {
        return !trackQuantity || stockQuantity > 0;
    }
    formatProduct(product) {
        return {
            ...product,
            price: product.price != null ? Number(product.price) : product.price,
            compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : product.compareAtPrice,
            costPrice: product.costPrice != null ? Number(product.costPrice) : product.costPrice,
            inStock: this.computeInStock(product.trackQuantity, product.stockQuantity),
        };
    }
    formatPublicProduct(product) {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDescription: product.shortDescription,
            price: product.price != null ? Number(product.price) : product.price,
            compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
            currency: product.currency,
            images: product.images?.map((img) => ({
                url: img.url,
                altText: img.altText,
            })) || [],
            inStock: this.computeInStock(product.trackQuantity, product.stockQuantity),
            availableQuantity: product.trackQuantity ? product.stockQuantity : 0,
            category: product.productCategories && product.productCategories.length > 0
                ? {
                    id: product.productCategories[0].category.id,
                    name: product.productCategories[0].category.name,
                    slug: product.productCategories[0].category.slug,
                }
                : null,
            featuredImage: product.featuredImage,
        };
    }
    formatPublicProductDetail(product) {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription,
            sku: product.sku,
            price: product.price != null ? Number(product.price) : product.price,
            compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : product.compareAtPrice,
            currency: product.currency,
            images: product.images?.map((img) => ({
                url: img.url,
                altText: img.altText,
            })) || [],
            inStock: this.computeInStock(product.trackQuantity, product.stockQuantity),
            availableQuantity: product.trackQuantity ? product.stockQuantity : 0,
            categories: product.productCategories?.map((pc) => ({
                id: pc.category.id,
                name: pc.category.name,
                slug: pc.category.slug,
            })) || [],
            featuredImage: product.featuredImage,
            seoTitle: product.seoTitle,
            seoDescription: product.seoDescription,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        };
    }
    async create(dto, actorUserId) {
        const [slugExists, skuExists] = await Promise.all([
            this.prisma.product.findUnique({ where: { slug: dto.slug } }),
            this.prisma.product.findUnique({ where: { sku: dto.sku } }),
        ]);
        if (slugExists)
            throw new common_1.ConflictException('Product slug already exists');
        if (skuExists)
            throw new common_1.ConflictException('Product SKU already exists');
        if (dto.categoryIds && dto.categoryIds.length > 0) {
            const foundCategories = await this.prisma.category.findMany({
                where: { id: { in: dto.categoryIds } },
                select: { id: true },
            });
            if (foundCategories.length !== dto.categoryIds.length) {
                const foundIds = foundCategories.map((c) => c.id);
                const invalid = dto.categoryIds.filter((id) => !foundIds.includes(id));
                throw new common_1.BadRequestException(`Invalid category IDs: ${invalid.join(', ')}`);
            }
        }
        const product = await this.prisma.product.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                sku: dto.sku,
                shortDescription: dto.shortDescription,
                description: dto.description,
                status: dto.status ?? client_1.ProductStatus.DRAFT,
                isActive: dto.isActive ?? true,
                featuredImage: dto.featuredImage,
                seoTitle: dto.seoTitle,
                seoDescription: dto.seoDescription,
                price: new client_1.Prisma.Decimal(dto.price),
                compareAtPrice: dto.compareAtPrice != null ? new client_1.Prisma.Decimal(dto.compareAtPrice) : undefined,
                costPrice: dto.costPrice != null ? new client_1.Prisma.Decimal(dto.costPrice) : undefined,
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
    async findAll(query) {
        const { page = 1, limit = 50, search, status, isActive, lowStock } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (isActive !== undefined)
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (lowStock) {
            where.trackQuantity = true;
            where.isActive = isActive !== undefined ? isActive : true;
        }
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
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                productCategories: { include: { category: true } },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.formatProduct(product);
    }
    async update(id, dto, actorUserId) {
        await this.findOne(id);
        if (dto.slug !== undefined && dto.slug !== null) {
            const existing = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Product slug already exists');
            }
        }
        if (dto.sku !== undefined && dto.sku !== null) {
            const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Product SKU already exists');
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
                throw new common_1.BadRequestException(`Invalid category IDs: ${invalid.join(', ')}`);
            }
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.slug !== undefined)
            updateData.slug = dto.slug;
        if (dto.sku !== undefined)
            updateData.sku = dto.sku;
        if (dto.shortDescription !== undefined)
            updateData.shortDescription = dto.shortDescription;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        if (dto.featuredImage !== undefined)
            updateData.featuredImage = dto.featuredImage;
        if (dto.seoTitle !== undefined)
            updateData.seoTitle = dto.seoTitle;
        if (dto.seoDescription !== undefined)
            updateData.seoDescription = dto.seoDescription;
        if (dto.price !== undefined)
            updateData.price = new client_1.Prisma.Decimal(dto.price);
        if (dto.compareAtPrice !== undefined) {
            updateData.compareAtPrice = dto.compareAtPrice != null ? new client_1.Prisma.Decimal(dto.compareAtPrice) : null;
        }
        if (dto.costPrice !== undefined) {
            updateData.costPrice = dto.costPrice != null ? new client_1.Prisma.Decimal(dto.costPrice) : null;
        }
        if (dto.currency !== undefined)
            updateData.currency = dto.currency;
        if (dto.trackQuantity !== undefined)
            updateData.trackQuantity = dto.trackQuantity;
        if (dto.stockQuantity !== undefined)
            updateData.stockQuantity = dto.stockQuantity;
        if (dto.lowStockThreshold !== undefined)
            updateData.lowStockThreshold = dto.lowStockThreshold;
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
    async remove(id, actorUserId) {
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
    async findPublicProducts(query) {
        const { page = 1, limit = 20, search, categoryId } = query;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
            status: client_1.ProductStatus.ACTIVE,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.productCategories = {
                some: {
                    categoryId,
                },
            };
        }
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
            items: items.map((p) => this.formatPublicProduct(p)),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findPublicProduct(idOrSlug) {
        const product = await this.prisma.product.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
                isActive: true,
                status: client_1.ProductStatus.ACTIVE,
            },
            include: {
                images: { orderBy: { sortOrder: 'asc' } },
                productCategories: { include: { category: true } },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.formatPublicProductDetail(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map