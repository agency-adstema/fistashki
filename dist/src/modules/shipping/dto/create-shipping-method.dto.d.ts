export declare class CreateShippingMethodDto {
    key: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    estimatedMinDays?: number;
    estimatedMaxDays?: number;
    isActive?: boolean;
}
