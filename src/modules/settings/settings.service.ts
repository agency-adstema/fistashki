import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  /**
   * Get all settings
   */
  async getAll(): Promise<Setting[]> {
    const settings = await this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
    return settings as Setting[];
  }

  /**
   * Get setting by key
   */
  async getByKey(key: string): Promise<Setting | null> {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    return setting as Setting | null;
  }

  /**
   * Get setting by key, throw if not found
   */
  async getByKeyOrThrow(key: string): Promise<Setting> {
    const setting = await this.getByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return setting;
  }

  /**
   * Create setting
   */
  async create(dto: CreateSettingDto): Promise<Setting> {
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

    return setting as Setting;
  }

  /**
   * Update setting
   */
  async update(key: string, dto: UpdateSettingDto, userId?: string): Promise<Setting> {
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

    return setting as Setting;
  }

  /**
   * Delete setting
   */
  async delete(key: string, userId?: string): Promise<void> {
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

  /**
   * Get store settings (public settings visible to public)
   */
  async getStoreSettings(): Promise<Record<string, string>> {
    const settings = await this.getAll();
    const storeSettings: Record<string, string> = {};

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

  /**
   * Get admin settings (all settings)
   */
  async getAdminSettings(): Promise<Record<string, string>> {
    const settings = await this.getAll();
    const adminSettings: Record<string, string> = {};

    settings.forEach((setting) => {
      adminSettings[setting.key] = setting.value;
    });

    return adminSettings;
  }
}
