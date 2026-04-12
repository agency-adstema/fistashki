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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let CategoriesService = class CategoriesService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async create(dto, actorUserId) {
        const existing = await this.prisma.category.findUnique({
            where: { slug: dto.slug },
        });
        if (existing)
            throw new common_1.ConflictException('Category slug already exists');
        if (dto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent)
                throw new common_1.NotFoundException('Parent category not found');
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
    async findOne(id) {
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
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async update(id, dto, actorUserId) {
        await this.findOne(id);
        if (dto.slug !== undefined && dto.slug !== null) {
            const existing = await this.prisma.category.findUnique({
                where: { slug: dto.slug },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Category slug already exists');
            }
        }
        if (dto.parentId) {
            if (dto.parentId === id) {
                throw new common_1.BadRequestException('A category cannot be its own parent');
            }
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent)
                throw new common_1.NotFoundException('Parent category not found');
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
    async remove(id, actorUserId) {
        const category = await this.findOne(id);
        if (category.children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete a category that has child categories. Remove or reassign children first.');
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
    async findPublicCategory(idOrSlug) {
        const category = await this.prisma.category.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
                isActive: true,
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
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return this.formatPublicCategory(category);
    }
    formatPublicCategory(category) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            parentId: category.parentId,
            sortOrder: category.sortOrder,
            productCount: category._count?.productCategories ?? 0,
            children: category.children && category.children.length > 0
                ? category.children.map((child) => this.formatPublicCategory(child))
                : [],
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map