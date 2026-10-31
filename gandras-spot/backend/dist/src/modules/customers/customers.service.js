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
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(restaurantId) {
        const customers = await this.prisma.customer.findMany({
            where: { restaurantId },
            orderBy: { totalSpent: 'desc' },
            include: {
                orders: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    select: { createdAt: true, total: true },
                },
            },
        });
        return customers.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            phone: c.phone,
            orderCount: c.orderCount,
            totalSpent: c.totalSpent,
            avgCheck: c.orderCount > 0 ? Math.round(c.totalSpent / c.orderCount) : 0,
            lastOrderAt: c.orders[0]?.createdAt ?? null,
            createdAt: c.createdAt,
        }));
    }
    findOne(restaurantId, id) {
        return this.prisma.customer.findFirst({
            where: { id, restaurantId },
            include: {
                addresses: true,
                orders: { orderBy: { createdAt: 'desc' } },
            },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map