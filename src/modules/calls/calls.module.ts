import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { CallQueueProcessor } from './call-queue.processor';
import { CallManagerService } from './services/call-manager.service';
import { PbxService } from './services/pbx.service';
import { AudioConverterService } from './services/audio-converter.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'calls',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    PrismaModule,
    AuditLogsModule,
    forwardRef(() => OrdersModule),
  ],
  providers: [
    CallsService,
    CallQueueProcessor,
    CallManagerService,
    PbxService,
    AudioConverterService,
  ],
  controllers: [CallsController],
  exports: [CallsService],
})
export class CallsModule {}
