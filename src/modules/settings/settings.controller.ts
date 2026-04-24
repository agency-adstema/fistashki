import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Setting } from './entities/setting.entity';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  /**
   * Get store settings (public)
   */
  @Get('store')
  async getStoreSettings(): Promise<Record<string, string>> {
    return this.settingsService.getStoreSettings();
  }

  /**
   * Get all settings (admin only)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.read')
  @Get()
  async getAll(): Promise<Setting[]> {
    return this.settingsService.getAll();
  }

  /**
   * Get setting by key (admin only)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.read')
  @Get(':key')
  async getByKey(@Param('key') key: string): Promise<Setting> {
    return this.settingsService.getByKeyOrThrow(key);
  }

  /**
   * Create setting (admin only)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Post()
  async create(@Body() dto: CreateSettingDto): Promise<Setting> {
    return this.settingsService.create(dto);
  }

  /**
   * Update setting (admin only)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Patch(':key')
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser('id') userId: string,
  ): Promise<Setting> {
    return this.settingsService.update(key, dto, userId);
  }

  /**
   * Delete setting (admin only)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('key') key: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.settingsService.delete(key, userId);
  }

  /**
   * Bulk update settings (admin only)
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Patch()
  async bulkUpdate(
    @Body() updates: Record<string, string>,
    @CurrentUser('id') userId: string,
  ): Promise<Setting[]> {
    const settings: Setting[] = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await this.settingsService.update(key, { value }, userId);
      settings.push(setting);
    }
    return settings;
  }
}
