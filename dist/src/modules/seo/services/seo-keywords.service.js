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
exports.SeoKeywordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SeoKeywordsService = class SeoKeywordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        try {
            return await this.prisma.seoKeyword.create({
                data: {
                    keyword: dto.keyword.trim(),
                    intent: dto.intent,
                    notes: dto.notes?.trim(),
                },
            });
        }
        catch {
            throw new common_1.ConflictException(`Keyword "${dto.keyword}" already exists`);
        }
    }
    async findAll(page = 1, limit = 50, status) {
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
    async findOne(id) {
        const row = await this.prisma.seoKeyword.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException(`SEO keyword ${id} not found`);
        return row;
    }
    async update(id, dto) {
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
        }
        catch {
            throw new common_1.ConflictException('Keyword value already in use');
        }
    }
    async setStatus(id, status) {
        return this.update(id, { status });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.seoKeyword.delete({ where: { id } });
    }
};
exports.SeoKeywordsService = SeoKeywordsService;
exports.SeoKeywordsService = SeoKeywordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoKeywordsService);
//# sourceMappingURL=seo-keywords.service.js.map