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
exports.NetworkOrderResponseDto = exports.ConfirmNetworkOrderDto = exports.CreateNetworkOrderDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateNetworkOrderDto {
    externalId;
    customerEmail;
    customerPhone;
    customerName;
    items;
    totalAmount;
    currency;
    notes;
    confirmationUrl;
    webhookUrl;
}
exports.CreateNetworkOrderDto = CreateNetworkOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'external-order-123', description: 'Unique order ID from network' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "externalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com', description: 'Customer email' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+381600000001', description: 'Customer phone number' }),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'Customer full name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            { sku: 'KREMA-001', name: 'Anti-aging Cream', quantity: 2, price: 2500 },
            { sku: 'CAJU-002', name: 'Herbal Tea', quantity: 1, price: 1500 },
        ],
        description: 'Array of ordered items with SKU, name, quantity, and price',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateNetworkOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6500, description: 'Total order amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateNetworkOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'RSD', default: 'RSD', description: 'Currency code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Special instructions for this order' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://network.com/confirm/12345' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "confirmationUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://network.com/webhook/orders' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNetworkOrderDto.prototype, "webhookUrl", void 0);
class ConfirmNetworkOrderDto {
    status;
    message;
}
exports.ConfirmNetworkOrderDto = ConfirmNetworkOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CONFIRMED', description: 'Order confirmation status' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmNetworkOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Order confirmed and added to queue' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfirmNetworkOrderDto.prototype, "message", void 0);
class NetworkOrderResponseDto {
    id;
    externalId;
    status;
    customerEmail;
    customerName;
    totalAmount;
    currency;
    createdAt;
    confirmedAt;
    order;
}
exports.NetworkOrderResponseDto = NetworkOrderResponseDto;
//# sourceMappingURL=create-network-order.dto.js.map