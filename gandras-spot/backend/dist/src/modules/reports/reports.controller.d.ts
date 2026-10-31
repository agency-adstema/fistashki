import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reports;
    constructor(reports: ReportsService);
    summary(restaurantId: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            deliveryCount: number;
            pickupCount: number;
            cashCount: number;
            cardCount: number;
            topCustomers: {
                id: string;
                firstName: string;
                lastName: string | null;
                phone: string;
                totalSpent: number;
                orderCount: number;
                avgCheck: number;
            }[];
            lowStock: {
                id: string;
                restaurantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                quantity: number;
                supplierId: string | null;
                unit: string;
                minQuantity: number;
                drinkId: string | null;
                extraId: string | null;
            }[];
            totalOrders: number;
            activeOrders: number;
            completedOrders: number;
            cancelledOrders: number;
            revenue: number;
            avgOrderValue: number;
            deliveries: number;
            pickups: number;
            topProducts: {
                name: string;
                count: number;
                revenue: number;
            }[];
            period: {
                from: Date;
                to: Date;
            };
        };
    }>;
    csv(restaurantId: string, res: Response, from?: string, to?: string): Promise<void>;
    excel(restaurantId: string, res: Response, from?: string, to?: string): Promise<void>;
}
