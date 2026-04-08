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
exports.ShippingMethodsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let ShippingMethodsService = class ShippingMethodsService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    formatMethod(m) {
        return { ...m, price: m.price != null ? Number(m.price) : m.price };
    }
    async create(dto, actorUserId) {
        const existing = await this.prisma.shippingMethod.findUnique({ where: { key: dto.key } });
        if (existing)
            throw new common_1.ConflictException(`Shipping method key '${dto.key}' already exists`);
        const method = await this.prisma.shippingMethod.create({
            data: {
                key: dto.key,
                name: dto.name,
                description: dto.description,
                price: new client_1.Prisma.Decimal(dto.price),
                currency: dto.currency ?? 'USD',
                estimatedMinDays: dto.estimatedMinDays,
                estimatedMaxDays: dto.estimatedMaxDays,
                isActive: dto.isActive ?? true,
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'shipping_method.created',
            entityType: 'ShippingMethod',
            entityId: method.id,
            metadata: { key: method.key, name: method.name },
        });
        return this.formatMethod(method);
    }
    async findAll(isActive) {
        const where = {};
        if (isActive !== undefined)
            where.isActive = isActive;
        const methods = await this.prisma.shippingMethod.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });
        return methods.map((m) => this.formatMethod(m));
    }
    async findOne(id) {
        const method = await this.prisma.shippingMethod.findUnique({ where: { id } });
        if (!method)
            throw new common_1.NotFoundException('Shipping method not found');
        return this.formatMethod(method);
    }
    async update(id, dto, actorUserId) {
        await this.findOne(id);
        if (dto.key) {
            const conflict = await this.prisma.shippingMethod.findFirst({
                where: { key: dto.key, id: { not: id } },
            });
            if (conflict)
                throw new common_1.ConflictException(`Shipping method key '${dto.key}' already in use`);
        }
        const updated = await this.prisma.shippingMethod.update({
            where: { id },
            data: {
                ...(dto.key && { key: dto.key }),
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: new client_1.Prisma.Decimal(dto.price) }),
                ...(dto.currency && { currency: dto.currency }),
                ...(dto.estimatedMinDays !== undefined && { estimatedMinDays: dto.estimatedMinDays }),
                ...(dto.estimatedMaxDays !== undefined && { estimatedMaxDays: dto.estimatedMaxDays }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'shipping_method.updated',
            entityType: 'ShippingMethod',
            entityId: id,
            metadata: dto,
        });
        return this.formatMethod(updated);
    }
    async remove(id, actorUserId) {
        await this.findOne(id);
        await this.prisma.shippingMethod.delete({ where: { id } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'shipping_method.deleted',
            entityType: 'ShippingMethod',
            entityId: id,
            metadata: {},
        });
        return { deleted: true };
    }
};
exports.ShippingMethodsService = ShippingMethodsService;
exports.ShippingMethodsService = ShippingMethodsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], ShippingMethodsService);
//# sourceMappingURL=shipping-methods.service.js.map