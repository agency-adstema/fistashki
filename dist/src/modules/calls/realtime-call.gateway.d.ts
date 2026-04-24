import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { PrismaService } from '../../prisma/prisma.service';
type WsClient = import('ws');
export declare class RealtimeCallGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    server: any;
    private readonly logger;
    private sessions;
    constructor(prisma: PrismaService);
    afterInit(server: any): void;
    handleConnection(client: WsClient): void;
    handleDisconnect(client: WsClient): void;
    private handleStartCall;
    private handleAudioData;
    private handleEndCall;
    private connectToOpenAIRealtime;
    private saveCallRecording;
    private declineToInstrumental;
    private cleanupSession;
}
export {};
