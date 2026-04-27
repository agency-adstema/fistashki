import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CustomersQueryDto } from './dto/customers-query.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(dto: CreateCustomerDto, user: any): Promise<{
        message: string;
        data: {
            _count: {
                orders: number;
            };
            addresses: {
                type: import(".prisma/client").$Enums.AddressType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string | null;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
                customerId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            isActive: boolean;
            notes: string | null;
        };
    }>;
    findAll(query: CustomersQueryDto): Promise<{
        message: string;
        data: {
            items: ({
                _count: {
                    orders: number;
                };
                addresses: {
                    type: import(".prisma/client").$Enums.AddressType;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    firstName: string;
                    lastName: string;
                    phone: string | null;
                    addressLine1: string;
                    addressLine2: string | null;
                    city: string;
                    postalCode: string;
                    country: string;
                    isDefault: boolean;
                    customerId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                isActive: boolean;
                notes: string | null;
            })[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: {
            orders: {
                grandTotal: number;
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.OrderStatus;
                currency: string;
                orderNumber: string;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                fulfillmentStatus: import(".prisma/client").$Enums.FulfillmentStatus;
            }[];
            _count: {
                orders: number;
            };
            addresses: {
                type: import(".prisma/client").$Enums.AddressType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string | null;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
                customerId: string;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            isActive: boolean;
            notes: string | null;
        };
    }>;
    update(id: string, dto: UpdateCustomerDto, user: any): Promise<{
        message: string;
        data: {
            _count: {
                orders: number;
            };
            addresses: {
                type: import(".prisma/client").$Enums.AddressType;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string | null;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
                customerId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            isActive: boolean;
            notes: string | null;
        };
    }>;
    addAddress(customerId: string, dto: CreateAddressDto, user: any): Promise<{
        message: string;
        data: {
            type: import(".prisma/client").$Enums.AddressType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
            customerId: string;
        };
    }>;
    getAddresses(customerId: string): Promise<{
        message: string;
        data: {
            type: import(".prisma/client").$Enums.AddressType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
            customerId: string;
        }[];
    }>;
    updateAddress(customerId: string, addressId: string, dto: UpdateAddressDto, user: any): Promise<{
        message: string;
        data: {
            type: import(".prisma/client").$Enums.AddressType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            addressLine1: string;
            addressLine2: string | null;
            city: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
            customerId: string;
        };
    }>;
    deleteAddress(customerId: string, addressId: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
