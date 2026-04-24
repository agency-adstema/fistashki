import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class OrderTagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    create(dto: CreateTagDto, req: any): Promise<{
        data: {
            id: string;
            createdAt: Date;
            name: string;
            key: string;
            updatedAt: Date;
            color: string | null;
        };
    }>;
    findAll(): Promise<{
        data: {
            id: string;
            createdAt: Date;
            name: string;
            key: string;
            updatedAt: Date;
            color: string | null;
        }[];
    }>;
    update(id: string, dto: UpdateTagDto, req: any): Promise<{
        data: {
            id: string;
            createdAt: Date;
            name: string;
            key: string;
            updatedAt: Date;
            color: string | null;
        };
    }>;
    remove(id: string, req: any): Promise<{
        data: {
            deleted: boolean;
        };
    }>;
}
