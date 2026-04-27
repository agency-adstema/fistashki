export declare class BlogPostQueryDto {
    page: number;
    limit: number;
    category?: string;
    published?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
