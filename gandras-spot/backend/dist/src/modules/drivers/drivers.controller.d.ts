import { DriverStatus } from '@prisma/client';
import { DriversService } from './drivers.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
export declare class DriversController {
    private drivers;
    constructor(drivers: DriversService);
    list(restaurantId: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    createCourier(restaurantId: string, body: CreateCourierDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    create(restaurantId: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    update(restaurantId: string, id: string, body: Record<string, unknown>): Promise<{
        success: boolean;
        data: ({
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
        }) | null;
    }>;
    status(restaurantId: string, id: string, status: DriverStatus): Promise<{
        success: boolean;
        data: ({
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
        }) | null;
    }>;
    updateCourier(restaurantId: string, id: string, body: UpdateCourierDto): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    remove(restaurantId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
        };
    }>;
}
