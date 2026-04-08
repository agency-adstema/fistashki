import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { RejectReturnDto } from './dto/reject-return.dto';
import { ReturnsQueryDto } from './dto/returns-query.dto';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    create(dto: CreateReturnDto, req: any): Promise<{
        data: any;
    }>;
    findAll(query: ReturnsQueryDto): Promise<{
        data: {
            items: any[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        data: any;
    }>;
    approve(id: string, req: any): Promise<{
        data: any;
    }>;
    reject(id: string, dto: RejectReturnDto, req: any): Promise<{
        data: any;
    }>;
    markReceived(id: string, req: any): Promise<{
        data: any;
    }>;
    markRefundPending(id: string, req: any): Promise<{
        data: any;
    }>;
    refund(id: string, req: any): Promise<{
        data: any;
    }>;
    complete(id: string, req: any): Promise<{
        data: any;
    }>;
    cancel(id: string, req: any): Promise<{
        data: any;
    }>;
}
