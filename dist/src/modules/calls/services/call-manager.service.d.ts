import { PrismaService } from '../../../prisma/prisma.service';
import { PbxService } from './pbx.service';
import { OpenAIService } from './openai.service';
export declare class CallManagerService {
    private prisma;
    private pbxService;
    private openaiService;
    private readonly logger;
    constructor(prisma: PrismaService, pbxService: PbxService, openaiService: OpenAIService);
    processCall(callJobId: string, orderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        summary: string | null;
        orderId: string | null;
        customerId: string;
        callJobId: string | null;
        duration: number | null;
        outcome: import(".prisma/client").$Enums.CallOutcome | null;
        transcript: import("@prisma/client/runtime/library").JsonValue | null;
        audioUrl: string | null;
        latencyMs: number | null;
    } | undefined>;
}
