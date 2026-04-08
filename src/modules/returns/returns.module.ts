import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [AuditLogsModule, PaymentsModule],
  providers: [ReturnsService],
  controllers: [ReturnsController],
  exports: [ReturnsService],
})
export class ReturnsModule {}
