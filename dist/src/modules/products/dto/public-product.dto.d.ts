export declare class PublicProductImageDto {
    url: string;
    altText?: string;
}
export declare class PublicProductCategoryDto {
    id: string;
    name: string;
}
export declare class PublicProductDto {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    images?: PublicProductImageDto[];
    inStock: boolean;
    availableQuantity: number;
    category?: PublicProductCategoryDto;
    featuredImage?: string;
}
export declare class PublicProductDetailDto extends PublicProductDto {
    sku?: string;
    shortDescription?: string;
    compareAtPrice?: number;
    seoTitle?: string;
    seoDescription?: string;
    categories?: PublicProductCategoryDto[];
    createdAt: string;
    updatedAt: string;
}
export declare class PublicProductsListResponseDto {
    items: PublicProductDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}
