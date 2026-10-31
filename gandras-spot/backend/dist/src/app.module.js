"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const orders_module_1 = require("./modules/orders/orders.module");
const menu_module_1 = require("./modules/menu/menu.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const customers_module_1 = require("./modules/customers/customers.module");
const coupons_module_1 = require("./modules/coupons/coupons.module");
const drivers_module_1 = require("./modules/drivers/drivers.module");
const payments_module_1 = require("./modules/payments/payments.module");
const reports_module_1 = require("./modules/reports/reports.module");
const restaurants_module_1 = require("./modules/restaurants/restaurants.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const health_controller_1 = require("./health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            orders_module_1.OrdersModule,
            menu_module_1.MenuModule,
            dashboard_module_1.DashboardModule,
            customers_module_1.CustomersModule,
            coupons_module_1.CouponsModule,
            drivers_module_1.DriversModule,
            payments_module_1.PaymentsModule,
            reports_module_1.ReportsModule,
            restaurants_module_1.RestaurantsModule,
            notifications_module_1.NotificationsModule,
            inventory_module_1.InventoryModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map