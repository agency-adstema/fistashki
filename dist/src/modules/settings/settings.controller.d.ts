import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getStoreSettings(): Promise<Record<string, string>>;
    getAll(): Promise<Setting[]>;
    getByKey(key: string): Promise<Setting>;
    create(dto: CreateSettingDto): Promise<Setting>;
    update(key: string, dto: UpdateSettingDto, userId: string): Promise<Setting>;
    delete(key: string, userId: string): Promise<void>;
    bulkUpdate(updates: Record<string, string>, userId: string): Promise<Setting[]>;
}
