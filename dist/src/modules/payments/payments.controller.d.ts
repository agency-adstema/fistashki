import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { MarkFailedDto } from './dto/mark-failed.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsQueryDto } from './dto/payments-query.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(dto: CreatePaymentDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    findAll(query: PaymentsQueryDto): Promise<{
        message: string;
        data: {
            items: any[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: any;
    }>;
    markPaid(id: string, dto: MarkPaidDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    markFailed(id: string, dto: MarkFailedDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    refund(id: string, dto: RefundPaymentDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
}
