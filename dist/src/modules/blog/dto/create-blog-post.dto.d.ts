export declare class CreateBlogPostDto {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: string;
    author: string;
    readTime?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    published?: boolean;
}
