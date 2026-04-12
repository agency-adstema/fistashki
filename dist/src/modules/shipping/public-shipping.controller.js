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
exports.PublicShippingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipping_methods_service_1 = require("./shipping-methods.service");
let PublicShippingController = class PublicShippingController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        const methods = await this.service.findAll();
        const active = methods.filter((m) => m.isActive !== false);
        return {
            items: active.map((m) => ({
                id: m.id,
                key: m.key,
                name: m.name,
                description: m.description,
                price: Number(m.price),
                estimatedDays: m.estimatedDays,
                isFree: Number(m.price) === 0,
                minOrderAmount: m.minOrderAmount ? Number(m.minOrderAmount) : null,
            })),
        };
    }
};
exports.PublicShippingController = PublicShippingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List active shipping methods (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicShippingController.prototype, "findAll", null);
exports.PublicShippingController = PublicShippingController = __decorate([
    (0, swagger_1.ApiTags)('public-shipping'),
    (0, common_1.Controller)('public/shipping-methods'),
    __metadata("design:paramtypes", [shipping_methods_service_1.ShippingMethodsService])
], PublicShippingController);
//# sourceMappingURL=public-shipping.controller.js.map