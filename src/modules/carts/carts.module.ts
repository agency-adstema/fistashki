import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [AuditLogsModule, CouponsModule],
  providers: [CartsService],
  controllers: [CartsController],
  exports: [CartsService],
})
export class CartsModule {}
