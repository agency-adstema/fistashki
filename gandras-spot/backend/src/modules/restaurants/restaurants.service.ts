import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getSettings(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { settings: true },
    });
    if (!restaurant) throw new NotFoundException();
    return restaurant;
  }

  async updateSettings(restaurantId: string, data: Record<string, unknown>) {
    const { settings, ...rest } = data;
    if (Object.keys(rest).length) {
      await this.prisma.restaurant.update({
        where: { id: restaurantId },
        data: rest as never,
      });
    }
    if (settings) {
      await this.prisma.restaurantSettings.update({
        where: { restaurantId },
        data: settings as never,
      });
    }
    return this.getSettings(restaurantId);
  }

  async getPublic(slug?: string) {
    const restaurantSlug = slug ?? this.config.get('RESTAURANT_SLUG', 'gandras-spot');
    return this.prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      include: { settings: true },
    });
  }
}
