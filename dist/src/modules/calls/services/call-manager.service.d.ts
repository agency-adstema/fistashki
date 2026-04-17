import { PrismaService } from '../../../prisma/prisma.service';
import { PbxService } from './pbx.service';
export declare class CallManagerService {
    private prisma;
    private pbxService;
    private readonly logger;
    constructor(prisma: PrismaService, pbxService: PbxService);
    processCall(callJobId: string, orderId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        summary: string | null;
        orderId: string;
        customerId: string;
        callJobId: string;
        duration: number | null;
        outcome: import(".prisma/client").$Enums.CallOutcome | null;
        transcript: import("@prisma/client/runtime/library").JsonValue | null;
        audioUrl: string | null;
    } | undefined>;
}
