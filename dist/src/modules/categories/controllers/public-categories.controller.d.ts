import { CategoriesService } from '../categories.service';
import { PublicCategoryDto, PublicCategoriesListResponseDto } from '../dto/public-category.dto';
export declare class PublicCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<PublicCategoriesListResponseDto>;
    nav(): Promise<{
        items: {
            name: string;
            slug: string;
        }[];
    }>;
    findOne(id: string): Promise<PublicCategoryDto>;
}
