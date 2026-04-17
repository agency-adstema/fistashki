import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CallManagerService } from './services/call-manager.service';
export declare class CallQueueProcessor extends WorkerHost {
    private callManagerService;
    private readonly logger;
    constructor(callManagerService: CallManagerService);
    process(job: Job<any>): Promise<any>;
}
