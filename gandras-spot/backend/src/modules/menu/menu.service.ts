import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MenuItemType, slugify } from './menu-item.util';

type MenuItemPayload = {
  name: string;
  price?: number;
  description?: string;
  slug?: string;
  isAvailable?: boolean;
  imageUrl?: string | null;
  /** Shop kategorija: burgers | sandwiches | lepinje | pomfrit */
  categorySlug?: string;
};

const PRODUCT_CATEGORY_SLUGS = ['burgers', 'sandwiches', 'lepinje', 'pomfrit'] as const;

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getPublicMenu(slug?: string) {
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
    if (!restaurant) throw new NotFoundException('Restaurant not found');

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

  async adminMenu(restaurantId: string) {
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

  private async resolveCategoryId(restaurantId: string, categorySlug?: string) {
    const slug =
      categorySlug && PRODUCT_CATEGORY_SLUGS.includes(categorySlug as (typeof PRODUCT_CATEGORY_SLUGS)[number])
        ? categorySlug
        : 'burgers';
    const cat = await this.prisma.category.findFirst({
      where: { restaurantId, slug },
    });
    return cat?.id ?? null;
  }

  async createMenuItem(restaurantId: string, type: MenuItemType, data: MenuItemPayload) {
    const slug = data.slug?.trim() || slugify(data.name);
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
            kind: ProductKind.BURGER,
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
        throw new BadRequestException('Invalid menu type');
    }
  }

  async updateMenuItem(restaurantId: string, type: MenuItemType, id: string, data: MenuItemPayload) {
    const payload: Record<string, unknown> = {
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
        throw new BadRequestException('Invalid menu type');
    }
    if (!count) throw new NotFoundException('Item not found');
    return { ok: true };
  }

  async deleteMenuItem(restaurantId: string, type: MenuItemType, id: string) {
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
        throw new BadRequestException('Invalid menu type');
    }
    if (!count) throw new NotFoundException('Item not found');
    return { ok: true };
  }

  createProduct(restaurantId: string, data: Record<string, unknown>) {
    return this.createMenuItem(restaurantId, 'burger', data as MenuItemPayload);
  }

  updateProduct(restaurantId: string, id: string, data: Record<string, unknown>) {
    return this.updateMenuItem(restaurantId, 'burger', id, data as MenuItemPayload);
  }

  deleteProduct(restaurantId: string, id: string) {
    return this.deleteMenuItem(restaurantId, 'burger', id);
  }
}
