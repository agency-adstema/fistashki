export declare class GuestInfoDto {
    email?: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export declare class CheckoutDto {
    customerId?: string;
    guest?: GuestInfoDto;
    shippingAddressId?: string;
    notes?: string;
}
