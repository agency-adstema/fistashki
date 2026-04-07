import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ProductsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    private computeInStock;
    private formatProduct;
    create(dto: CreateProductDto, actorUserId?: string): Promise<any>;
    findAll(pagination: PaginationDto, status?: ProductStatus): Promise<{
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
}
