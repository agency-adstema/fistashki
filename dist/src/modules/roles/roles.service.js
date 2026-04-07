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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.role.findMany({
            include: {
                rolePermissions: { include: { permission: true } },
                _count: { select: { userRoles: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                rolePermissions: { include: { permission: true } },
            },
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async create(dto) {
        const existing = await this.prisma.role.findUnique({
            where: { key: dto.key },
        });
        if (existing)
            throw new common_1.ConflictException('Role key already exists');
        return this.prisma.role.create({ data: dto });
    }
    async assignPermissions(roleId, permissionIds) {
        await this.findOne(roleId);
        if (permissionIds.length > 0) {
            const found = await this.prisma.permission.findMany({
                where: { id: { in: permissionIds } },
                select: { id: true },
            });
            if (found.length !== permissionIds.length) {
                const foundIds = found.map((p) => p.id);
                const invalid = permissionIds.filter((id) => !foundIds.includes(id));
                throw new common_1.BadRequestException(`Invalid permission IDs: ${invalid.join(', ')}`);
            }
        }
        await this.prisma.rolePermission.deleteMany({ where: { roleId } });
        if (permissionIds.length > 0) {
            await this.prisma.rolePermission.createMany({
                data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
            });
        }
        return this.findOne(roleId);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map