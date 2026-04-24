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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let SettingsService = class SettingsService {
    prisma;
    auditLogs;
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    async getAll() {
        const settings = await this.prisma.setting.findMany({
            orderBy: { key: 'asc' },
        });
        return settings;
    }
    async getByKey(key) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });
        return setting;
    }
    async getByKeyOrThrow(key) {
        const setting = await this.getByKey(key);
        if (!setting) {
            throw new common_1.NotFoundException(`Setting "${key}" not found`);
        }
        return setting;
    }
    async create(dto) {
        const existing = await this.getByKey(dto.key);
        if (existing) {
            throw new Error(`Setting "${dto.key}" already exists`);
        }
        const setting = await this.prisma.setting.create({
            data: {
                key: dto.key,
                value: dto.value,
                description: dto.description,
            },
        });
        await this.auditLogs.log({
            action: 'SETTING_CREATED',
            entityType: 'setting',
            entityId: setting.key,
            metadata: { value: dto.value },
        });
        return setting;
    }
    async update(key, dto, userId) {
        const existing = await this.getByKeyOrThrow(key);
        const setting = await this.prisma.setting.update({
            where: { key },
            data: {
                value: dto.value ?? existing.value,
                description: dto.description ?? existing.description,
            },
        });
        await this.auditLogs.log({
            action: 'SETTING_UPDATED',
            entityType: 'setting',
            entityId: setting.key,
            metadata: { oldValue: existing.value, newValue: setting.value },
            actorUserId: userId,
        });
        return setting;
    }
    async delete(key, userId) {
        const existing = await this.getByKeyOrThrow(key);
        await this.prisma.setting.delete({
            where: { key },
        });
        await this.auditLogs.log({
            action: 'SETTING_DELETED',
            entityType: 'setting',
            entityId: key,
            metadata: { value: existing.value },
            actorUserId: userId,
        });
    }
    async getStoreSettings() {
        const settings = await this.getAll();
        const storeSettings = {};
        const publicKeys = [
            'STORE_NAME',
            'STORE_EMAIL',
            'STORE_PHONE',
            'STORE_ADDRESS',
            'STORE_LOGO_URL',
            'COMPANY_NAME',
        ];
        settings.forEach((setting) => {
            if (publicKeys.includes(setting.key)) {
                storeSettings[setting.key] = setting.value;
            }
        });
        return storeSettings;
    }
    async getAdminSettings() {
        const settings = await this.getAll();
        const adminSettings = {};
        settings.forEach((setting) => {
            adminSettings[setting.key] = setting.value;
        });
        return adminSettings;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map