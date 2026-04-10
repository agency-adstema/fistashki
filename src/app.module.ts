import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { CartsModule } from './modules/carts/carts.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { AdminOpsModule } from './modules/admin-ops/admin-ops.module';
import { HealthModule } from './health/health.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuditLogsModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    DashboardModule,
    PaymentsModule,
    ShippingModule,
    CartsModule,
    CouponsModule,
    ReturnsModule,
    AdminOpsModule,
    UploadModule,
  ],
})
export class AppModule {}
