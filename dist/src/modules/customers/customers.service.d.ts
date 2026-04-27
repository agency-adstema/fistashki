import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CustomersQueryDto } from './dto/customers-query.dto';
export declare class CustomersService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    create(dto: CreateCustomerDto, actorUserId?: string): Promise<{
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
    }>;
    findAll(query: CustomersQueryDto): Promise<{
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
    }>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateCustomerDto, actorUserId?: string): Promise<{
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
    }>;
    addAddress(customerId: string, dto: CreateAddressDto, actorUserId?: string): Promise<{
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
    }>;
    getAddresses(customerId: string): Promise<{
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
    }[]>;
    updateAddress(customerId: string, addressId: string, dto: UpdateAddressDto, actorUserId?: string): Promise<{
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
    }>;
    deleteAddress(customerId: string, addressId: string, actorUserId?: string): Promise<{
        id: string;
    }>;
}
