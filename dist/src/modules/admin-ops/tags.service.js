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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let TagsService = class TagsService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async createTag(dto, actorUserId) {
        const existing = await this.prisma.orderTag.findUnique({
            where: { key: dto.key.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException(`Tag with key "${dto.key}" already exists`);
        }
        const tag = await this.prisma.orderTag.create({
            data: { key: dto.key.toLowerCase(), name: dto.name, color: dto.color ?? null },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.tag.created',
            entityType: 'OrderTag',
            entityId: tag.id,
            metadata: { key: tag.key, name: tag.name },
        });
        return tag;
    }
    async findAllTags() {
        return this.prisma.orderTag.findMany({ orderBy: { name: 'asc' } });
    }
    async findOneTag(id) {
        const tag = await this.prisma.orderTag.findUnique({ where: { id } });
        if (!tag)
            throw new common_1.NotFoundException('Tag not found');
        return tag;
    }
    async updateTag(id, dto, actorUserId) {
        await this.findOneTag(id);
        const updated = await this.prisma.orderTag.update({
            where: { id },
            data: {
                ...(dto.name != null && { name: dto.name }),
                ...(dto.color !== undefined && { color: dto.color }),
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.tag.updated',
            entityType: 'OrderTag',
            entityId: id,
            metadata: { changes: dto },
        });
        return updated;
    }
    async deleteTag(id, actorUserId) {
        await this.findOneTag(id);
        await this.prisma.orderTag.delete({ where: { id } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.tag.deleted',
            entityType: 'OrderTag',
            entityId: id,
            metadata: {},
        });
        return { deleted: true };
    }
    async getOrderTags(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const assignments = await this.prisma.orderTagAssignment.findMany({
            where: { orderId },
            include: { tag: true },
            orderBy: { createdAt: 'asc' },
        });
        return assignments.map((a) => a.tag);
    }
    async assignTag(orderId, tagId, actorUserId) {
        const [order, tag] = await Promise.all([
            this.prisma.order.findUnique({ where: { id: orderId } }),
            this.prisma.orderTag.findUnique({ where: { id: tagId } }),
        ]);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!tag)
            throw new common_1.NotFoundException('Tag not found');
        const existing = await this.prisma.orderTagAssignment.findUnique({
            where: { orderId_tagId: { orderId, tagId } },
        });
        if (existing) {
            throw new common_1.ConflictException('Tag is already assigned to this order');
        }
        await this.prisma.orderTagAssignment.create({ data: { orderId, tagId } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.tag.assigned',
            entityType: 'Order',
            entityId: orderId,
            metadata: { tagId, tagKey: tag.key, tagName: tag.name },
        });
        return tag;
    }
    async removeTag(orderId, tagId, actorUserId) {
        const assignment = await this.prisma.orderTagAssignment.findUnique({
            where: { orderId_tagId: { orderId, tagId } },
            include: { tag: true },
        });
        if (!assignment)
            throw new common_1.NotFoundException('Tag assignment not found');
        await this.prisma.orderTagAssignment.delete({
            where: { orderId_tagId: { orderId, tagId } },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.tag.removed',
            entityType: 'Order',
            entityId: orderId,
            metadata: { tagId, tagKey: assignment.tag.key },
        });
        return { removed: true };
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], TagsService);
//# sourceMappingURL=tags.service.js.map