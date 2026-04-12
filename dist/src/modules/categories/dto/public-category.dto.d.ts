export declare class PublicCategoryDto {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
    children?: PublicCategoryDto[];
    productCount: number;
}
export declare class PublicCategoriesListResponseDto {
    items: PublicCategoryDto[];
}
