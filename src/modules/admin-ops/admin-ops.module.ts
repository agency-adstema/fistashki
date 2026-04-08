import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { TagsService } from './tags.service';
import { AdminOpsService } from './admin-ops.service';
import { OrderNotesController } from './order-notes.controller';
import { CustomerNotesController } from './customer-notes.controller';
import { OrderTagsController } from './order-tags.controller';
import { OrderAdminController } from './order-admin.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  providers: [NotesService, TagsService, AdminOpsService],
  controllers: [
    OrderNotesController,
    CustomerNotesController,
    OrderTagsController,
    OrderAdminController,
  ],
  exports: [NotesService, TagsService, AdminOpsService],
})
export class AdminOpsModule {}
