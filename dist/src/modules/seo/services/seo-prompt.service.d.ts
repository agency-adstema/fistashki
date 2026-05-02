import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSeoPromptVersionDto, UpdateSeoPromptVersionDto } from '../dto/seo-prompt.dto';
export declare class SeoPromptService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        label: string;
        systemPrompt: string;
        userTemplate: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        label: string;
        systemPrompt: string;
        userTemplate: string;
    }>;
    create(dto: CreateSeoPromptVersionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        label: string;
        systemPrompt: string;
        userTemplate: string;
    }>;
    update(id: string, dto: UpdateSeoPromptVersionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        label: string;
        systemPrompt: string;
        userTemplate: string;
    }>;
    activate(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        label: string;
        systemPrompt: string;
        userTemplate: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
