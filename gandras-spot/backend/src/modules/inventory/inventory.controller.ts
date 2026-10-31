import { Body, Controller, Get, Patch, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RestaurantId, Roles } from '../../common/decorators/auth.decorators';

@ApiTags('inventory')
@Controller('admin/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth('access-token')
export class InventoryController {
  constructor(private inventory: InventoryService) {}

  @Get('suppliers')
  suppliers(@RestaurantId() restaurantId: string) {
    return this.inventory.listSuppliers(restaurantId).then((data) => ({ success: true, data }));
  }

  @Post('suppliers')
  createSupplier(@RestaurantId() restaurantId: string, @Body() body: { name: string; phone?: string; email?: string; note?: string }) {
    return this.inventory.createSupplier(restaurantId, body).then((data) => ({ success: true, data }));
  }

  @Patch('suppliers/:id')
  updateSupplier(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; phone?: string; email?: string; note?: string },
  ) {
    return this.inventory.updateSupplier(restaurantId, id, body).then((data) => ({ success: true, data }));
  }

  @Get('stock')
  stock(@RestaurantId() restaurantId: string) {
    return this.inventory.listStock(restaurantId).then((data) => ({ success: true, data }));
  }

  @Post('stock')
  createStock(@RestaurantId() restaurantId: string, @Body() body: Record<string, unknown>) {
    return this.inventory
      .createStockItem(restaurantId, body as never)
      .then((data) => ({ success: true, data }));
  }

  @Patch('stock/:id')
  updateStock(
    @RestaurantId() restaurantId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; quantity?: number; minQuantity?: number; supplierId?: string | null; unit?: string },
  ) {
    return this.inventory.updateStockItem(restaurantId, id, body).then((data) => ({ success: true, data }));
  }

  @Post('deliveries')
  delivery(
    @RestaurantId() restaurantId: string,
    @Body() body: { supplierId: string; note?: string; items: { stockItemId: string; quantity: number }[] },
  ) {
    return this.inventory
      .recordDelivery(restaurantId, body.supplierId, body.items, body.note)
      .then((data) => ({ success: true, data }));
  }

  @Get('low-stock')
  lowStock(@RestaurantId() restaurantId: string) {
    return this.inventory.lowStock(restaurantId).then((data) => ({ success: true, data }));
  }
}
