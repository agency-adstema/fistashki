import { AddressType } from '@prisma/client';
export declare class CreateAddressDto {
    type: AddressType;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
}
