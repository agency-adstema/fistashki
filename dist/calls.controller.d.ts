import { CallsService } from './calls.service';
export declare class CallsController {
    private readonly callsService;
    constructor(callsService: CallsService);
    getAllCalls(page?: string, limit?: string): Promise<{
        message: string;
        data: any;
    }>;
    getStats(): Promise<{
        message: string;
        data: any;
    }>;
    getCall(id: string): Promise<{
        message: string;
        data: any;
    }>;
    retryCall(callLogId: string, user: any): Promise<{
        message: string;
        data: any;
    }>;
}
