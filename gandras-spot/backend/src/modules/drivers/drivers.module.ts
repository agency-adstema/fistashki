import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [DriversService, CourierService],
  controllers: [DriversController, CourierController],
})
export class DriversModule {}
