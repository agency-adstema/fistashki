import { DeliveryMethod, PaymentMethod } from '@prisma/client';
declare class CustomerDto {
    firstName: string;
    lastName?: string;
    phone: string;
    address?: string;
    city?: string;
    note?: string;
}
declare class QuantityItemDto {
    id: string;
    quantity: number;
}
declare class BurgerConfigDto {
    burgerId: string;
    breadId?: string;
    ingredientIds?: string[];
    extraIds?: string[];
    sizeId?: string;
}
export declare class CreateOrderDto {
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    customer: CustomerDto;
    breadId?: string;
    burgerId?: string;
    burgerItems?: QuantityItemDto[];
    burgerConfigs?: BurgerConfigDto[];
    ingredientIds?: string[];
    extraIds?: string[];
    drinkId?: string;
    drinkItems?: QuantityItemDto[];
    couponCode?: string;
}
export {};
