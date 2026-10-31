import { DriverStatus } from '@prisma/client';
import { CourierService } from './courier.service';
import { AuthUser } from '../../common/decorators/auth.decorators';
export declare class CourierController {
    private courier;
    constructor(courier: CourierService);
    me(restaurantId: string, user: AuthUser): Promise<{
        success: boolean;
        data: {
            id: string;
            firstName: string;
            lastName: string | null;
            phone: string;
            status: import(".prisma/client").$Enums.DriverStatus;
            payPerDelivery: number;
        };
    }>;
    dashboard(restaurantId: string, user: AuthUser): Promise<{
        success: boolean;
        data: {
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
                    options: import("@prisma/client/runtime/library").JsonValue;
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
                    options: import("@prisma/client/runtime/library").JsonValue;
                }[];
            }[];
            earnings: {
                payPerDelivery: number;
                today: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
                week: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
                month: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
            };
        };
    }>;
    earnings(restaurantId: string, user: AuthUser): Promise<{
        success: boolean;
        data: {
            payPerDelivery: number;
            today: {
                count: number;
                total: number;
                deliveries: {
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }[];
            };
            week: {
                count: number;
                total: number;
                deliveries: {
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }[];
            };
            month: {
                count: number;
                total: number;
                deliveries: {
                    id: string;
                    displayId: string;
                    completedAt: string;
                    customerAddress: string | null;
                    customerCity: string | null;
                    pay: number;
                }[];
            };
        };
    }>;
    claim(restaurantId: string, user: AuthUser, id: string): Promise<{
        success: boolean;
        data: {
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
                    options: import("@prisma/client/runtime/library").JsonValue;
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
                    options: import("@prisma/client/runtime/library").JsonValue;
                }[];
            }[];
            earnings: {
                payPerDelivery: number;
                today: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
                week: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
                month: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
            };
        };
    }>;
    complete(restaurantId: string, user: AuthUser, id: string): Promise<{
        success: boolean;
        data: {
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
                    options: import("@prisma/client/runtime/library").JsonValue;
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
                    options: import("@prisma/client/runtime/library").JsonValue;
                }[];
            }[];
            earnings: {
                payPerDelivery: number;
                today: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
                week: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
                month: {
                    count: number;
                    total: number;
                    deliveries: {
                        id: string;
                        displayId: string;
                        completedAt: string;
                        customerAddress: string | null;
                        customerCity: string | null;
                        pay: number;
                    }[];
                };
            };
        };
    }>;
    status(restaurantId: string, user: AuthUser, status: DriverStatus): Promise<{
        success: boolean;
        data: {
            id: string;
            firstName: string;
            lastName: string | null;
            phone: string;
            status: import(".prisma/client").$Enums.DriverStatus;
            payPerDelivery: number;
        };
    }>;
}
