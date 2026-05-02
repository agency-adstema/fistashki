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
exports.SeoPromptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SeoPromptService = class SeoPromptService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.seoPromptVersion.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const v = await this.prisma.seoPromptVersion.findUnique({ where: { id } });
        if (!v)
            throw new common_1.NotFoundException(`Prompt version ${id} not found`);
        return v;
    }
    async create(dto) {
        return this.prisma.seoPromptVersion.create({
            data: {
                label: dto.label.trim(),
                systemPrompt: dto.systemPrompt,
                userTemplate: dto.userTemplate,
                isActive: false,
            },
        });
    }
    async update(id, dto) {
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
    async activate(id) {
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
    async remove(id) {
        const v = await this.findOne(id);
        const inUse = await this.prisma.blogPost.count({
            where: { promptVersionId: id },
        });
        if (inUse > 0) {
            throw new common_1.BadRequestException('Cannot delete a prompt version that is referenced by blog posts (deactivate instead).');
        }
        await this.prisma.seoPromptVersion.delete({ where: { id } });
        return { id: v.id, deleted: true };
    }
};
exports.SeoPromptService = SeoPromptService;
exports.SeoPromptService = SeoPromptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoPromptService);
//# sourceMappingURL=seo-prompt.service.js.map