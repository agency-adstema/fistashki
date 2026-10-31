import ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
export declare class ReportsService {
    private prisma;
    private orders;
    constructor(prisma: PrismaService, orders: OrdersService);
    summary(restaurantId: string, from?: string, to?: string): Promise<{
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
    }>;
    exportCsv(restaurantId: string, from?: string, to?: string): Promise<string>;
    exportExcel(restaurantId: string, from?: string, to?: string): Promise<ExcelJS.Buffer>;
}
