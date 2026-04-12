import { ShippingMethodsService } from './shipping-methods.service';
export declare class PublicShippingController {
    private readonly service;
    constructor(service: ShippingMethodsService);
    findAll(): Promise<{
        items: {
            id: any;
            key: any;
            name: any;
            description: any;
            price: number;
            estimatedDays: any;
            isFree: boolean;
            minOrderAmount: number | null;
        }[];
    }>;
}
