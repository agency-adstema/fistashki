import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
export declare class ProductsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    private computeInStock;
    private formatProduct;
    private formatPublicProduct;
    private formatPublicProductDetail;
    create(dto: CreateProductDto, actorUserId?: string): Promise<any>;
    findAll(query: ProductsQueryDto): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateProductDto, actorUserId?: string): Promise<any>;
    remove(id: string, actorUserId?: string): Promise<{
        id: string;
    }>;
    findPublicProducts(query: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: string;
    }): Promise<{
        items: {
            id: any;
            name: any;
            slug: any;
            description: any;
            shortDescription: any;
            price: any;
            compareAtPrice: number | null;
            currency: any;
            images: any;
            inStock: boolean;
            availableQuantity: any;
            category: {
                id: any;
                name: any;
                slug: any;
            } | null;
            featuredImage: any;
        }[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findPublicProduct(idOrSlug: string): Promise<{
        id: any;
        name: any;
        description: any;
        shortDescription: any;
        sku: any;
        price: any;
        compareAtPrice: any;
        currency: any;
        images: any;
        inStock: boolean;
        availableQuantity: any;
        categories: any;
        featuredImage: any;
        seoTitle: any;
        seoDescription: any;
        createdAt: any;
        updatedAt: any;
    }>;
}
