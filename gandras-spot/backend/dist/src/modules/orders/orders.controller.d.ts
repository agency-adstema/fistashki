import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AcceptOrderDto, RejectOrderDto, UpdateOrderStatusDto } from './dto/order-actions.dto';
import { AuthUser } from '../../common/decorators/auth.decorators';
import { ConfigService } from '@nestjs/config';
export declare class OrdersController {
    private orders;
    private config;
    constructor(orders: OrdersService, config: ConfigService);
    create(dto: CreateOrderDto): Promise<{
        success: boolean;
        data: {
            trackingUrl: string;
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
        };
    }>;
    track(token: string): Promise<{
        success: boolean;
        data: {
            expired: boolean;
            message: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderNumber: number;
        } | {
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
            expired: boolean;
            message?: undefined;
        };
    }>;
    list(restaurantId: string, status?: OrderStatus): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
        }[];
    }>;
    listNew(restaurantId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
        }[];
    }>;
    one(restaurantId: string, id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
        };
    }>;
    accept(restaurantId: string, id: string, dto: AcceptOrderDto, user: AuthUser): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
        };
    }>;
    reject(restaurantId: string, id: string, dto: RejectOrderDto, user: AuthUser): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
        };
    }>;
    updateStatus(restaurantId: string, id: string, dto: UpdateOrderStatusDto, user: AuthUser): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: number;
            token: string;
            displayId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            deliveryMethod: import(".prisma/client").$Enums.DeliveryMethod;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            customer: {
                firstName: string;
                lastName: string | null;
                phone: string;
                address: string | null;
                city: string | null;
                note: string | null;
            };
            internalNote: string | null;
            items: {
                id: string;
                name: string;
                orderId: string;
                productId: string | null;
                kind: string | null;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                note: string | null;
            }[];
            subtotal: number;
            deliveryFee: number;
            discount: number;
            tax: number;
            total: number;
            estimatedMinutes: number | null;
            estimatedReadyAt: Date | null;
            driverId: string | null;
            driver: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
            } | null;
            createdAt: Date;
            acceptedAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            trackingExpiresAt: Date | null;
            statusHistory: {
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                orderId: string;
                note: string | null;
                createdBy: string | null;
            }[];
        };
    }>;
}
