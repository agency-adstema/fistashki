import { ProductsService } from '../products.service';
import { PublicProductDetailDto, PublicProductsListResponseDto } from '../dto/public-product.dto';
export declare class PublicProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(page?: string, limit?: string, search?: string, category?: string): Promise<PublicProductsListResponseDto>;
    findOne(id: string): Promise<PublicProductDetailDto>;
}
