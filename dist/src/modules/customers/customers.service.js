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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let CustomersService = class CustomersService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async create(dto, actorUserId) {
        const existing = await this.prisma.customer.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (existing)
            throw new common_1.ConflictException('Customer with this email already exists');
        const customer = await this.prisma.customer.create({
            data: {
                email: dto.email.toLowerCase().trim(),
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                notes: dto.notes,
                isActive: dto.isActive ?? true,
            },
            include: {
                addresses: true,
                _count: { select: { orders: true } },
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customers.create',
            entityType: 'Customer',
            entityId: customer.id,
            metadata: { email: customer.email, firstName: customer.firstName, lastName: customer.lastName },
        });
        return customer;
    }
    async findAll(query) {
        const { page = 1, limit = 50, search, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (isActive !== undefined)
            where.isActive = isActive;
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    addresses: true,
                    _count: { select: { orders: true } },
                },
            }),
            this.prisma.customer.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                addresses: { orderBy: { createdAt: 'asc' } },
                orders: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        paymentStatus: true,
                        fulfillmentStatus: true,
                        grandTotal: true,
                        currency: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { orders: true } },
            },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return {
            ...customer,
            orders: customer.orders.map((o) => ({
                ...o,
                grandTotal: Number(o.grandTotal),
            })),
        };
    }
    async update(id, dto, actorUserId) {
        await this.findOne(id);
        if (dto.email !== undefined) {
            const existing = await this.prisma.customer.findUnique({
                where: { email: dto.email.toLowerCase().trim() },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Customer with this email already exists');
            }
        }
        const customer = await this.prisma.customer.update({
            where: { id },
            data: {
                ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
                ...(dto.firstName !== undefined && { firstName: dto.firstName }),
                ...(dto.lastName !== undefined && { lastName: dto.lastName }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.notes !== undefined && { notes: dto.notes }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
            include: {
                addresses: true,
                _count: { select: { orders: true } },
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customers.update',
            entityType: 'Customer',
            entityId: customer.id,
            metadata: { changes: dto },
        });
        return customer;
    }
    async addAddress(customerId, dto, actorUserId) {
        await this.findOne(customerId);
        if (dto.isDefault) {
            await this.prisma.customerAddress.updateMany({
                where: { customerId, type: dto.type, isDefault: true },
                data: { isDefault: false },
            });
        }
        const address = await this.prisma.customerAddress.create({
            data: {
                customerId,
                type: dto.type,
                firstName: dto.firstName,
                lastName: dto.lastName,
                addressLine1: dto.addressLine1,
                addressLine2: dto.addressLine2,
                city: dto.city,
                postalCode: dto.postalCode,
                country: dto.country,
                phone: dto.phone,
                isDefault: dto.isDefault ?? false,
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customers.address.create',
            entityType: 'CustomerAddress',
            entityId: address.id,
            metadata: { customerId, type: address.type },
        });
        return address;
    }
    async getAddresses(customerId) {
        await this.findOne(customerId);
        return this.prisma.customerAddress.findMany({
            where: { customerId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async updateAddress(customerId, addressId, dto, actorUserId) {
        await this.findOne(customerId);
        const address = await this.prisma.customerAddress.findFirst({
            where: { id: addressId, customerId },
        });
        if (!address)
            throw new common_1.NotFoundException('Address not found');
        const targetType = dto.type ?? address.type;
        if (dto.isDefault === true) {
            await this.prisma.customerAddress.updateMany({
                where: { customerId, type: targetType, isDefault: true, id: { not: addressId } },
                data: { isDefault: false },
            });
        }
        const updated = await this.prisma.customerAddress.update({
            where: { id: addressId },
            data: {
                ...(dto.type !== undefined && { type: dto.type }),
                ...(dto.firstName !== undefined && { firstName: dto.firstName }),
                ...(dto.lastName !== undefined && { lastName: dto.lastName }),
                ...(dto.addressLine1 !== undefined && { addressLine1: dto.addressLine1 }),
                ...(dto.addressLine2 !== undefined && { addressLine2: dto.addressLine2 }),
                ...(dto.city !== undefined && { city: dto.city }),
                ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
                ...(dto.country !== undefined && { country: dto.country }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
            },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customers.address.update',
            entityType: 'CustomerAddress',
            entityId: addressId,
            metadata: { customerId, changes: dto },
        });
        return updated;
    }
    async deleteAddress(customerId, addressId, actorUserId) {
        await this.findOne(customerId);
        const address = await this.prisma.customerAddress.findFirst({
            where: { id: addressId, customerId },
        });
        if (!address)
            throw new common_1.NotFoundException('Address not found');
        await this.prisma.customerAddress.delete({ where: { id: addressId } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customers.address.delete',
            entityType: 'CustomerAddress',
            entityId: addressId,
            metadata: { customerId },
        });
        return { id: addressId };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map