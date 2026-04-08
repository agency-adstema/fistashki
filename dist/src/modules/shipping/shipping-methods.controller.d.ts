import { ShippingMethodsService } from './shipping-methods.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
export declare class ShippingMethodsController {
    private readonly service;
    constructor(service: ShippingMethodsService);
    create(dto: CreateShippingMethodDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    findAll(isActive?: boolean): Promise<{
        message: string;
        data: any[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: any;
    }>;
    update(id: string, dto: UpdateShippingMethodDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            deleted: boolean;
        };
    }>;
}
