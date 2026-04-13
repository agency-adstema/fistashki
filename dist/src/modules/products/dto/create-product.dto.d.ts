import { ProductStatus } from '@prisma/client';
export declare class ProductImageDto {
    url: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
}
export declare class CreateProductDto {
    name: string;
    slug: string;
    sku: string;
    shortDescription?: string;
    description?: string;
    benefits?: string;
    howToUse?: string;
    composition?: string;
    bestSeason?: string;
    suitablePlants?: string;
    status?: ProductStatus;
    isActive?: boolean;
    featuredImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    currency?: string;
    trackQuantity?: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    images?: ProductImageDto[];
    categoryIds?: string[];
}
