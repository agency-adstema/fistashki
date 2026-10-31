"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const menu_item_util_1 = require("./menu-item.util");
const PRODUCT_CATEGORY_SLUGS = ['burgers', 'sandwiches', 'lepinje', 'pomfrit'];
let MenuService = class MenuService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async getPublicMenu(slug) {
        const restaurantSlug = slug ?? this.config.get('RESTAURANT_SLUG', 'gandras-spot');
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { slug: restaurantSlug },
            include: {
                settings: true,
                products: {
                    where: { isAvailable: true },
                    orderBy: { sortOrder: 'asc' },
                    include: { category: true },
                },
                breadTypes: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } },
                ingredients: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } },
                extras: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } },
                drinks: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } },
                categories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!restaurant)
            throw new common_1.NotFoundException('Restaurant not found');
        const products = restaurant.products.map((p) => ({
            ...p,
            categorySlug: p.category?.slug ?? 'burgers',
        }));
        return {
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                logoUrl: restaurant.logoUrl,
                settings: restaurant.settings,
            },
            burgers: products,
            products,
            breads: restaurant.breadTypes,
            ingredients: restaurant.ingredients,
            extras: restaurant.extras,
            drinks: restaurant.drinks,
            categories: restaurant.categories,
        };
    }
    async adminMenu(restaurantId) {
        const [products, breads, ingredients, extras, drinks, categories] = await Promise.all([
            this.prisma.product.findMany({
                where: { restaurantId },
                orderBy: { sortOrder: 'asc' },
                include: { category: true },
            }),
            this.prisma.breadType.findMany({ where: { restaurantId }, orderBy: { sortOrder: 'asc' } }),
            this.prisma.ingredient.findMany({ where: { restaurantId }, orderBy: { sortOrder: 'asc' } }),
            this.prisma.extra.findMany({ where: { restaurantId }, orderBy: { sortOrder: 'asc' } }),
            this.prisma.drink.findMany({ where: { restaurantId }, orderBy: { sortOrder: 'asc' } }),
            this.prisma.category.findMany({ where: { restaurantId }, orderBy: { sortOrder: 'asc' } }),
        ]);
        return {
            products: products.map((p) => ({
                ...p,
                categorySlug: p.category?.slug ?? 'burgers',
            })),
            breads,
            ingredients,
            extras,
            drinks,
            categories,
        };
    }
    async resolveCategoryId(restaurantId, categorySlug) {
        const slug = categorySlug && PRODUCT_CATEGORY_SLUGS.includes(categorySlug)
            ? categorySlug
            : 'burgers';
        const cat = await this.prisma.category.findFirst({
            where: { restaurantId, slug },
        });
        return cat?.id ?? null;
    }
    async createMenuItem(restaurantId, type, data) {
        const slug = data.slug?.trim() || (0, menu_item_util_1.slugify)(data.name);
        const base = {
            restaurantId,
            name: data.name,
            slug,
            price: data.price ?? 0,
            description: data.description,
            imageUrl: data.imageUrl,
            isAvailable: data.isAvailable ?? true,
        };
        switch (type) {
            case 'burger': {
                const categoryId = await this.resolveCategoryId(restaurantId, data.categorySlug);
                return this.prisma.product.create({
                    data: {
                        restaurantId,
                        name: data.name,
                        slug,
                        price: data.price ?? 0,
                        description: data.description,
                        imageUrl: data.imageUrl ?? undefined,
                        isAvailable: data.isAvailable ?? true,
                        kind: client_1.ProductKind.BURGER,
                        categoryId,
                    },
                });
            }
            case 'bread':
                return this.prisma.breadType.create({ data: base });
            case 'ingredient':
                return this.prisma.ingredient.create({ data: base });
            case 'extra':
                return this.prisma.extra.create({ data: base });
            case 'drink':
                return this.prisma.drink.create({ data: base });
            default:
                throw new common_1.BadRequestException('Invalid menu type');
        }
    }
    async updateMenuItem(restaurantId, type, id, data) {
        const payload = {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.price !== undefined ? { price: data.price } : {}),
            ...(data.description !== undefined ? { description: data.description } : {}),
            ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
            ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        };
        if (type === 'burger' && data.categorySlug !== undefined) {
            payload.categoryId = await this.resolveCategoryId(restaurantId, data.categorySlug);
        }
        let count = 0;
        switch (type) {
            case 'burger':
                count = (await this.prisma.product.updateMany({ where: { id, restaurantId }, data: payload })).count;
                break;
            case 'bread':
                count = (await this.prisma.breadType.updateMany({ where: { id, restaurantId }, data: payload })).count;
                break;
            case 'ingredient':
                count = (await this.prisma.ingredient.updateMany({ where: { id, restaurantId }, data: payload })).count;
                break;
            case 'extra':
                count = (await this.prisma.extra.updateMany({ where: { id, restaurantId }, data: payload })).count;
                break;
            case 'drink':
                count = (await this.prisma.drink.updateMany({ where: { id, restaurantId }, data: payload })).count;
                break;
            default:
                throw new common_1.BadRequestException('Invalid menu type');
        }
        if (!count)
            throw new common_1.NotFoundException('Item not found');
        return { ok: true };
    }
    async deleteMenuItem(restaurantId, type, id) {
        let count = 0;
        switch (type) {
            case 'burger':
                count = (await this.prisma.product.deleteMany({ where: { id, restaurantId } })).count;
                break;
            case 'bread':
                count = (await this.prisma.breadType.deleteMany({ where: { id, restaurantId } })).count;
                break;
            case 'ingredient':
                count = (await this.prisma.ingredient.deleteMany({ where: { id, restaurantId } })).count;
                break;
            case 'extra':
                count = (await this.prisma.extra.deleteMany({ where: { id, restaurantId } })).count;
                break;
            case 'drink':
                count = (await this.prisma.drink.deleteMany({ where: { id, restaurantId } })).count;
                break;
            default:
                throw new common_1.BadRequestException('Invalid menu type');
        }
        if (!count)
            throw new common_1.NotFoundException('Item not found');
        return { ok: true };
    }
    createProduct(restaurantId, data) {
        return this.createMenuItem(restaurantId, 'burger', data);
    }
    updateProduct(restaurantId, id, data) {
        return this.updateMenuItem(restaurantId, 'burger', id, data);
    }
    deleteProduct(restaurantId, id) {
        return this.deleteMenuItem(restaurantId, 'burger', id);
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MenuService);
//# sourceMappingURL=menu.service.js.map