import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(dto: CreateProductDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    findAll(query: ProductsQueryDto): Promise<{
        message: string;
        data: {
            items: any[];
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: any;
    }>;
    update(id: string, dto: UpdateProductDto, user: any): Promise<{
        message: string;
        data: any;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
        data: {
            id: string;
        };
    }>;
}
