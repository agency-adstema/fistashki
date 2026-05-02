import { PrismaService } from '../../../prisma/prisma.service';
export declare class BlogImageService {
    private readonly prisma;
    private readonly logger;
    private readonly apiKey;
    private readonly chatModel;
    private readonly imageModel;
    constructor(prisma: PrismaService);
    private publicUrl;
    private ensureBlogUploadDir;
    private refinePromptWithChat;
    private fallbackPrompt;
    private generateOnePng;
    generateAndAttachImages(blogPostId: string, opts: {
        refinePrompt?: boolean;
        separateFeatured?: boolean;
    }): Promise<{
        featuredImage: string;
        ogImage: string;
        imagePromptUsed: string;
    }>;
}
