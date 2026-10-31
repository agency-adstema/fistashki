"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
let DriversService = class DriversService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(restaurantId) {
        return this.prisma.driver.findMany({
            where: { restaurantId, isActive: true },
            include: {
                user: { select: { id: true, email: true } },
                orders: {
                    where: { status: { in: ['OUT_FOR_DELIVERY', 'READY'] } },
                    select: { id: true, orderNumber: true, status: true },
                },
            },
            orderBy: { firstName: 'asc' },
        });
    }
    async createCourierAccount(restaurantId, dto) {
        const email = dto.email.toLowerCase();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new common_1.BadRequestException('Email je već u upotrebi');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                },
            });
            await tx.restaurantUser.create({
                data: {
                    restaurantId,
                    userId: user.id,
                    role: client_1.UserRole.COURIER,
                },
            });
            return tx.driver.create({
                data: {
                    restaurantId,
                    userId: user.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    phone: dto.phone,
                    payPerDelivery: dto.payPerDelivery,
                    status: client_1.DriverStatus.OFFLINE,
                },
                include: { user: { select: { id: true, email: true } } },
            });
        });
    }
    create(restaurantId, data) {
        return this.prisma.driver.create({ data: { restaurantId, ...data } });
    }
    async update(restaurantId, id, data) {
        const result = await this.prisma.driver.updateMany({
            where: { id, restaurantId },
            data: data,
        });
        if (!result.count)
            throw new common_1.NotFoundException();
        return this.prisma.driver.findUnique({
            where: { id },
            include: { user: { select: { id: true, email: true } } },
        });
    }
    setStatus(restaurantId, id, status) {
        return this.update(restaurantId, id, { status });
    }
    async updateCourierAccount(restaurantId, id, dto) {
        const driver = await this.prisma.driver.findFirst({
            where: { id, restaurantId, isActive: true },
            include: { user: true },
        });
        if (!driver)
            throw new common_1.NotFoundException();
        if (dto.email) {
            const email = dto.email.toLowerCase();
            const existing = await this.prisma.user.findFirst({
                where: {
                    email,
                    ...(driver.userId ? { id: { not: driver.userId } } : {}),
                },
            });
            if (existing)
                throw new common_1.BadRequestException('Email je već u upotrebi');
        }
        return this.prisma.$transaction(async (tx) => {
            const driverData = {};
            if (dto.firstName !== undefined)
                driverData.firstName = dto.firstName;
            if (dto.lastName !== undefined)
                driverData.lastName = dto.lastName || null;
            if (dto.phone !== undefined)
                driverData.phone = dto.phone;
            if (dto.payPerDelivery !== undefined)
                driverData.payPerDelivery = dto.payPerDelivery;
            if (driver.userId) {
                const userData = {};
                if (dto.email)
                    userData.email = dto.email.toLowerCase();
                if (dto.password)
                    userData.passwordHash = await bcrypt.hash(dto.password, 10);
                if (dto.firstName !== undefined)
                    userData.firstName = dto.firstName;
                if (dto.lastName !== undefined)
                    userData.lastName = dto.lastName || null;
                if (Object.keys(userData).length > 0) {
                    await tx.user.update({ where: { id: driver.userId }, data: userData });
                }
            }
            return tx.driver.update({
                where: { id },
                data: driverData,
                include: { user: { select: { id: true, email: true } } },
            });
        });
    }
    async remove(restaurantId, id) {
        const driver = await this.prisma.driver.findFirst({
            where: { id, restaurantId, isActive: true },
        });
        if (!driver)
            throw new common_1.NotFoundException();
        const activeOrders = await this.prisma.order.count({
            where: {
                driverId: id,
                status: { in: ['READY', 'OUT_FOR_DELIVERY'] },
            },
        });
        if (activeOrders > 0) {
            throw new common_1.BadRequestException('Kurir ima aktivne dostave. Završite ih pre brisanja.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.driver.update({
                where: { id },
                data: { isActive: false, status: client_1.DriverStatus.OFFLINE },
            });
            if (driver.userId) {
                await tx.user.update({
                    where: { id: driver.userId },
                    data: { isActive: false },
                });
            }
            return { id };
        });
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map