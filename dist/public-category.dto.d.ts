export declare class PublicCategoryDto {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
    image?: string;
    seoTitle?: string;
    seoDescription?: string;
    children?: PublicCategoryDto[];
    productCount: number;
}
export declare class PublicCategoriesListResponseDto {
    items: PublicCategoryDto[];
}
