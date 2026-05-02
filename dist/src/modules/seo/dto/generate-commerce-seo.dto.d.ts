export declare enum CommerceContentType {
    CATEGORY_MONEY_PAGE = "CATEGORY_MONEY_PAGE",
    PRODUCT = "PRODUCT",
    BLOG = "BLOG",
    FAQ_ONLY = "FAQ_ONLY",
    META_ONLY = "META_ONLY"
}
export declare class CommerceSeoProductInputDto {
    name: string;
    benefits?: string;
    priceDisplay?: string;
    slug?: string;
}
export declare class GenerateCommerceSeoDto {
    contentType: CommerceContentType;
    mainKeyword: string;
    relatedKeywords?: string[];
    buyerIntentKeywords?: string[];
    targetCategory: string;
    categoryId?: string;
    products?: CommerceSeoProductInputDto[];
    internalLinks?: string[];
    toneOfVoice?: string;
    language?: string;
    country?: string;
    wordCountTarget?: number;
    ctaTarget?: string;
    brandNotes?: string;
    contextSummary?: string;
    primaryProductName?: string;
}
