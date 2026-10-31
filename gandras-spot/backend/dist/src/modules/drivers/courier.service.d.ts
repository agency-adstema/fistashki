import { DriverStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
export declare class CourierService {
    private prisma;
    private orders;
    constructor(prisma: PrismaService, orders: OrdersService);
    private resolveDriver;
    private payPerDelivery;
    profile(restaurantId: string, userId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string | null;
        phone: string;
        status: import(".prisma/client").$Enums.DriverStatus;
        payPerDelivery: number;
    }>;
    dashboard(restaurantId: string, userId: string): Promise<{
        driver: {
            id: string;
            firstName: string;
            lastName: string | null;
            phone: string;
            status: import(".prisma/client").$Enums.DriverStatus;
            payPerDelivery: number;
        };
        queue: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            total: number;
            deliveryFee: number;
            completedAt: Date | null;
            createdAt: Date;
            items: {
                name: string;
                quantity: number;
                totalPrice: number;
                kind: string | null;
                options: Prisma.JsonValue;
            }[];
        }[];
        active: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            total: number;
            deliveryFee: number;
            completedAt: Date | null;
            createdAt: Date;
            items: {
                name: string;
                quantity: number;
                totalPrice: number;
                kind: string | null;
                options: Prisma.JsonValue;
            }[];
        }[];
        earnings: {
            payPerDelivery: number;
            today: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
            week: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
            month: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
        };
    }>;
    earnings(restaurantId: string, userId: string): Promise<{
        payPerDelivery: number;
        today: {
            count: number;
            total: number;
            deliveries: Array<{
                id: string;
                displayId: string;
                completedAt: string;
                customerAddress: string | null;
                customerCity: string | null;
                pay: number;
            }>;
        };
        week: {
            count: number;
            total: number;
            deliveries: Array<{
                id: string;
                displayId: string;
                completedAt: string;
                customerAddress: string | null;
                customerCity: string | null;
                pay: number;
            }>;
        };
        month: {
            count: number;
            total: number;
            deliveries: Array<{
                id: string;
                displayId: string;
                completedAt: string;
                customerAddress: string | null;
                customerCity: string | null;
                pay: number;
            }>;
        };
    }>;
    claim(restaurantId: string, userId: string, orderId: string): Promise<{
        driver: {
            id: string;
            firstName: string;
            lastName: string | null;
            phone: string;
            status: import(".prisma/client").$Enums.DriverStatus;
            payPerDelivery: number;
        };
        queue: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            total: number;
            deliveryFee: number;
            completedAt: Date | null;
            createdAt: Date;
            items: {
                name: string;
                quantity: number;
                totalPrice: number;
                kind: string | null;
                options: Prisma.JsonValue;
            }[];
        }[];
        active: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            total: number;
            deliveryFee: number;
            completedAt: Date | null;
            createdAt: Date;
            items: {
                name: string;
                quantity: number;
                totalPrice: number;
                kind: string | null;
                options: Prisma.JsonValue;
            }[];
        }[];
        earnings: {
            payPerDelivery: number;
            today: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
            week: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
            month: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
        };
    }>;
    complete(restaurantId: string, userId: string, orderId: string): Promise<{
        driver: {
            id: string;
            firstName: string;
            lastName: string | null;
            phone: string;
            status: import(".prisma/client").$Enums.DriverStatus;
            payPerDelivery: number;
        };
        queue: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            total: number;
            deliveryFee: number;
            completedAt: Date | null;
            createdAt: Date;
            items: {
                name: string;
                quantity: number;
                totalPrice: number;
                kind: string | null;
                options: Prisma.JsonValue;
            }[];
        }[];
        active: {
            id: string;
            orderNumber: number;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            driverId: string | null;
            customerFirstName: string;
            customerLastName: string | null;
            customerPhone: string;
            customerAddress: string | null;
            customerCity: string | null;
            customerNote: string | null;
            total: number;
            deliveryFee: number;
            completedAt: Date | null;
            createdAt: Date;
            items: {
                name: string;
                quantity: number;
                totalPrice: number;
                kind: string | null;
                options: Prisma.JsonValue;
            }[];
        }[];
        earnings: {
            payPerDelivery: number;
            today: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
            week: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
            month: {
                count: number;
                total: number;
                deliveries: Array<{
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }>;
            };
        };
    }>;
    setStatus(restaurantId: string, userId: string, status: DriverStatus): Promise<{
        id: string;
        firstName: string;
        lastName: string | null;
        phone: string;
        status: import(".prisma/client").$Enums.DriverStatus;
        payPerDelivery: number;
    }>;
}
