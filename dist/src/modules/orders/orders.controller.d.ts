import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UpdateFulfillmentStatusDto } from './dto/update-fulfillment-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    findAll(query: OrdersQueryDto): Promise<{
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
    updateStatus(id: string, dto: UpdateOrderStatusDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    updateFulfillmentStatus(id: string, dto: UpdateFulfillmentStatusDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    cancelOrder(id: string, dto: CancelOrderDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    deleteOrder(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
