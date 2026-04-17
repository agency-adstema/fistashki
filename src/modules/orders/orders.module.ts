import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [AuditLogsModule, forwardRef(() => CallsModule)],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
