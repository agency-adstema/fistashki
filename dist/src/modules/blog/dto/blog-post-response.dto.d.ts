export declare class BlogPostResponseDto {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: string;
    author: string;
    readTime: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    published: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BlogPostListResponseDto {
    items: BlogPostResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}
