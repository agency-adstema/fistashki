import { Module } from '@nestjs/common';
import { NetworkOrdersController } from './network-orders.controller';
import { NetworkOrdersService } from './network-orders.service';

@Module({
  controllers: [NetworkOrdersController],
  providers: [NetworkOrdersService],
  exports: [NetworkOrdersService],
})
export class NetworkOrdersModule {}
