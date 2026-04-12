"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingModule = void 0;
const common_1 = require("@nestjs/common");
const shipping_methods_service_1 = require("./shipping-methods.service");
const shipping_methods_controller_1 = require("./shipping-methods.controller");
const public_shipping_controller_1 = require("./public-shipping.controller");
const shipments_service_1 = require("./shipments.service");
const shipments_controller_1 = require("./shipments.controller");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
let ShippingModule = class ShippingModule {
};
exports.ShippingModule = ShippingModule;
exports.ShippingModule = ShippingModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_logs_module_1.AuditLogsModule],
        providers: [shipping_methods_service_1.ShippingMethodsService, shipments_service_1.ShipmentsService],
        controllers: [shipping_methods_controller_1.ShippingMethodsController, public_shipping_controller_1.PublicShippingController, shipments_controller_1.ShipmentsController],
        exports: [shipping_methods_service_1.ShippingMethodsService, shipments_service_1.ShipmentsService],
    })
], ShippingModule);
//# sourceMappingURL=shipping.module.js.map