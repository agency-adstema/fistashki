import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AssignCustomerDto } from './dto/assign-customer.dto';
import { AssignShippingMethodDto } from './dto/assign-shipping-method.dto';
import { AssignPaymentMethodDto } from './dto/assign-payment-method.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CartsQueryDto } from './dto/carts-query.dto';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    findAll(query: CartsQueryDto): Promise<{
        message: string;
        data: {
            items: any[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    create(dto: CreateCartDto): Promise<{
        message: string;
        data: any;
    }>;
    findBySession(sessionId: string): Promise<{
        message: string;
        data: any;
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: any;
    }>;
    addItem(id: string, dto: AddCartItemDto): Promise<{
        message: string;
        data: any;
    }>;
    updateItem(id: string, itemId: string, dto: UpdateCartItemDto): Promise<{
        message: string;
        data: any;
    }>;
    removeItem(id: string, itemId: string): Promise<{
        message: string;
        data: any;
    }>;
    clearItems(id: string): Promise<{
        message: string;
        data: any;
    }>;
    assignCustomer(id: string, dto: AssignCustomerDto): Promise<{
        message: string;
        data: any;
    }>;
    assignShippingMethod(id: string, dto: AssignShippingMethodDto): Promise<{
        message: string;
        data: any;
    }>;
    assignPaymentMethod(id: string, dto: AssignPaymentMethodDto): Promise<{
        message: string;
        data: any;
    }>;
    checkout(id: string, dto: CheckoutDto): Promise<{
        message: string;
        data: {
            order: any;
            payment: any;
        };
    }>;
}
