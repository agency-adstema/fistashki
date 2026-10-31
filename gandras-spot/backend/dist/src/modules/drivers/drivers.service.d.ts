import { DriverStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
export declare class DriversService {
    private prisma;
    constructor(prisma: PrismaService);
    list(restaurantId: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            email: string;
        } | null;
        orders: {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderNumber: number;
        }[];
    } & {
        id: string;
        restaurantId: string;
        userId: string | null;
        firstName: string;
        lastName: string | null;
        phone: string;
        payPerDelivery: number | null;
        status: import(".prisma/client").$Enums.DriverStatus;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createCourierAccount(restaurantId: string, dto: CreateCourierDto): Promise<{
        user: {
            id: string;
            email: string;
        } | null;
    } & {
        id: string;
        restaurantId: string;
        userId: string | null;
        firstName: string;
        lastName: string | null;
        phone: string;
        payPerDelivery: number | null;
        status: import(".prisma/client").$Enums.DriverStatus;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(restaurantId: string, data: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__DriverClient<{
        id: string;
        restaurantId: string;
        userId: string | null;
        firstName: string;
        lastName: string | null;
        phone: string;
        payPerDelivery: number | null;
        status: import(".prisma/client").$Enums.DriverStatus;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(restaurantId: string, id: string, data: Record<string, unknown>): Promise<({
        user: {
            id: string;
            email: string;
        } | null;
    } & {
        id: string;
        restaurantId: string;
        userId: string | null;
        firstName: string;
        lastName: string | null;
        phone: string;
        payPerDelivery: number | null;
        status: import(".prisma/client").$Enums.DriverStatus;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    setStatus(restaurantId: string, id: string, status: DriverStatus): Promise<({
        user: {
            id: string;
            email: string;
        } | null;
    } & {
        id: string;
        restaurantId: string;
        userId: string | null;
        firstName: string;
        lastName: string | null;
        phone: string;
        payPerDelivery: number | null;
        status: import(".prisma/client").$Enums.DriverStatus;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    updateCourierAccount(restaurantId: string, id: string, dto: UpdateCourierDto): Promise<{
        user: {
            id: string;
            email: string;
        } | null;
    } & {
        id: string;
        restaurantId: string;
        userId: string | null;
        firstName: string;
        lastName: string | null;
        phone: string;
        payPerDelivery: number | null;
        status: import(".prisma/client").$Enums.DriverStatus;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(restaurantId: string, id: string): Promise<{
        id: string;
    }>;
}
