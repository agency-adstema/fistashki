import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  providers: [CouponsService],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}
