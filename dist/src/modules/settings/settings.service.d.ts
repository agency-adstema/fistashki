import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
export declare class SettingsService {
    private prisma;
    private auditLogs;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService);
    getAll(): Promise<Setting[]>;
    getByKey(key: string): Promise<Setting | null>;
    getByKeyOrThrow(key: string): Promise<Setting>;
    create(dto: CreateSettingDto): Promise<Setting>;
    update(key: string, dto: UpdateSettingDto, userId?: string): Promise<Setting>;
    delete(key: string, userId?: string): Promise<void>;
    getStoreSettings(): Promise<Record<string, string>>;
    getAdminSettings(): Promise<Record<string, string>>;
}
