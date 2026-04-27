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
const bullmq_1 = require("@nestjs/bullmq");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const roles_module_1 = require("./modules/roles/roles.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const categories_module_1 = require("./modules/categories/categories.module");
const products_module_1 = require("./modules/products/products.module");
const customers_module_1 = require("./modules/customers/customers.module");
const orders_module_1 = require("./modules/orders/orders.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const payments_module_1 = require("./modules/payments/payments.module");
const shipping_module_1 = require("./modules/shipping/shipping.module");
const carts_module_1 = require("./modules/carts/carts.module");
const coupons_module_1 = require("./modules/coupons/coupons.module");
const returns_module_1 = require("./modules/returns/returns.module");
const admin_ops_module_1 = require("./modules/admin-ops/admin-ops.module");
const health_module_1 = require("./health/health.module");
const upload_module_1 = require("./modules/upload/upload.module");
const settings_module_1 = require("./modules/settings/settings.module");
const calls_module_1 = require("./modules/calls/calls.module");
const blog_module_1 = require("./modules/blog/blog.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                },
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            audit_logs_module_1.AuditLogsModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            customers_module_1.CustomersModule,
            orders_module_1.OrdersModule,
            dashboard_module_1.DashboardModule,
            payments_module_1.PaymentsModule,
            shipping_module_1.ShippingModule,
            carts_module_1.CartsModule,
            coupons_module_1.CouponsModule,
            returns_module_1.ReturnsModule,
            admin_ops_module_1.AdminOpsModule,
            upload_module_1.UploadModule,
            settings_module_1.SettingsModule,
            calls_module_1.CallsModule,
            blog_module_1.BlogModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map