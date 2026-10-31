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
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let RestaurantsService = class RestaurantsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async getSettings(restaurantId) {
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { settings: true },
        });
        if (!restaurant)
            throw new common_1.NotFoundException();
        return restaurant;
    }
    async updateSettings(restaurantId, data) {
        const { settings, ...rest } = data;
        if (Object.keys(rest).length) {
            await this.prisma.restaurant.update({
                where: { id: restaurantId },
                data: rest,
            });
        }
        if (settings) {
            await this.prisma.restaurantSettings.update({
                where: { restaurantId },
                data: settings,
            });
        }
        return this.getSettings(restaurantId);
    }
    async getPublic(slug) {
        const restaurantSlug = slug ?? this.config.get('RESTAURANT_SLUG', 'gandras-spot');
        return this.prisma.restaurant.findUnique({
            where: { slug: restaurantSlug },
            include: { settings: true },
        });
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map