import { Module } from '@nestjs/common';
import { ShippingMethodsService } from './shipping-methods.service';
import { ShippingMethodsController } from './shipping-methods.controller';
import { PublicShippingController } from './public-shipping.controller';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  providers: [ShippingMethodsService, ShipmentsService],
  controllers: [ShippingMethodsController, PublicShippingController, ShipmentsController],
  exports: [ShippingMethodsService, ShipmentsService],
})
export class ShippingModule {}
