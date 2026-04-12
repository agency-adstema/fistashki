import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingMethodsService } from './shipping-methods.service';

@ApiTags('public-shipping')
@Controller('public/shipping-methods')
export class PublicShippingController {
  constructor(private readonly service: ShippingMethodsService) {}

  @Get()
  @ApiOperation({ summary: 'List active shipping methods (public)' })
  async findAll() {
    const methods = await this.service.findAll();
    const active = methods.filter((m: any) => m.isActive !== false);
    return {
      items: active.map((m: any) => ({
        id: m.id,
        key: m.key,
        name: m.name,
        description: m.description,
        price: Number(m.price),
        estimatedDays: m.estimatedDays,
        isFree: Number(m.price) === 0,
        minOrderAmount: m.minOrderAmount ? Number(m.minOrderAmount) : null,
      })),
    };
  }
}
