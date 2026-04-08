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
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const coupons_utils_1 = require("./coupons.utils");
let CouponsService = class CouponsService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    formatCoupon(c) {
        return {
            ...c,
            value: Number(c.value),
            minOrderAmount: c.minOrderAmount != null ? Number(c.minOrderAmount) : null,
            maxDiscountAmount: c.maxDiscountAmount != null ? Number(c.maxDiscountAmount) : null,
        };
    }
    async create(dto, actorUserId) {
        const code = dto.code.toUpperCase();
        const existing = await this.prisma.coupon.findUnique({ where: { code } });
        if (existing)
            throw new common_1.ConflictException(`Coupon code '${code}' already exists`);
        if (new Date(dto.validFrom) >= new Date(dto.validTo)) {
            throw new common_1.BadRequestException('validFrom must be before validTo');
        }
        const coupon = await this.prisma.coupon.create({
            data: {
                code,
                type: dto.type,
                value: new client_1.Prisma.Decimal(dto.value),
                currency: dto.currency ?? 'USD',
                minOrderAmount: dto.minOrderAmount != null ? new client_1.Prisma.Decimal(dto.minOrderAmount) : undefined,
                maxDiscountAmount: dto.maxDiscountAmount != null ? new client_1.Prisma.Decimal(dto.maxDiscountAmount) : undefined,
                usageLimit: dto.usageLimit,
                perUserLimit: dto.perUserLimit,
                isActive: dto.isActive ?? true,
                validFrom: new Date(dto.validFrom),
                validTo: new Date(dto.validTo),
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'coupon.created',
            entityType: 'Coupon',
            entityId: coupon.id,
            metadata: { code: coupon.code, type: coupon.type },
        });
        return this.formatCoupon(coupon);
    }
    async findAll(query) {
        const { page = 1, limit = 50, type, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.type = type;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [items, total] = await Promise.all([
            this.prisma.coupon.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            this.prisma.coupon.count({ where }),
        ]);
        return {
            items: items.map((c) => this.formatCoupon(c)),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        return this.formatCoupon(coupon);
    }
    async findByCode(code) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        return this.formatCoupon(coupon);
    }
    async update(id, dto, actorUserId) {
        await this.findOne(id);
        if (dto.code) {
            const conflict = await this.prisma.coupon.findFirst({
                where: { code: dto.code.toUpperCase(), id: { not: id } },
            });
            if (conflict)
                throw new common_1.ConflictException(`Coupon code '${dto.code}' already in use`);
        }
        const updated = await this.prisma.coupon.update({
            where: { id },
            data: {
                ...(dto.code && { code: dto.code.toUpperCase() }),
                ...(dto.type && { type: dto.type }),
                ...(dto.value !== undefined && { value: new client_1.Prisma.Decimal(dto.value) }),
                ...(dto.currency && { currency: dto.currency }),
                ...(dto.minOrderAmount !== undefined && {
                    minOrderAmount: dto.minOrderAmount != null ? new client_1.Prisma.Decimal(dto.minOrderAmount) : null,
                }),
                ...(dto.maxDiscountAmount !== undefined && {
                    maxDiscountAmount: dto.maxDiscountAmount != null ? new client_1.Prisma.Decimal(dto.maxDiscountAmount) : null,
                }),
                ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
                ...(dto.perUserLimit !== undefined && { perUserLimit: dto.perUserLimit }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.validFrom && { validFrom: new Date(dto.validFrom) }),
                ...(dto.validTo && { validTo: new Date(dto.validTo) }),
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'coupon.updated',
            entityType: 'Coupon',
            entityId: id,
            metadata: dto,
        });
        return this.formatCoupon(updated);
    }
    async remove(id, actorUserId) {
        await this.findOne(id);
        await this.prisma.coupon.delete({ where: { id } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'coupon.deleted',
            entityType: 'Coupon',
            entityId: id,
            metadata: {},
        });
        return { deleted: true };
    }
    async validateForCart(code, subtotal, customerId) {
        const raw = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (!raw)
            throw new common_1.NotFoundException('Coupon not found');
        if (!raw.isActive)
            throw new common_1.BadRequestException('Coupon is inactive');
        const now = new Date();
        if (now < raw.validFrom)
            throw new common_1.BadRequestException('Coupon is not yet valid');
        if (now > raw.validTo)
            throw new common_1.BadRequestException('Coupon has expired');
        if (raw.usageLimit != null && raw.usedCount >= raw.usageLimit) {
            throw new common_1.BadRequestException('Coupon usage limit has been reached');
        }
        if (raw.perUserLimit != null && customerId) {
            const customerUsage = await this.prisma.couponUsage.count({
                where: {
                    couponId: raw.id,
                    order: { customerId },
                },
            });
            if (customerUsage >= raw.perUserLimit) {
                throw new common_1.BadRequestException('You have reached the usage limit for this coupon');
            }
        }
        const discount = (0, coupons_utils_1.calculateDiscount)(raw, subtotal);
        return { coupon: this.formatCoupon(raw), discount };
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map