import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseBoolPipe,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ShippingMethodsService } from './shipping-methods.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('shipping-methods')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('shipping-methods')
export class ShippingMethodsController {
  constructor(private readonly service: ShippingMethodsService) {}

  @Post()
  @Permissions('shipping_methods.create')
  @ApiOperation({ summary: 'Create a shipping method' })
  async create(@Body() dto: CreateShippingMethodDto, @CurrentUser() user: any) {
    const data = await this.service.create(dto, user?.id);
    return { message: 'Shipping method created successfully', data };
  }

  @Get()
  @Permissions('shipping_methods.read')
  @ApiOperation({ summary: 'List shipping methods' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean) {
    const data = await this.service.findAll(isActive);
    return { message: 'Shipping methods fetched successfully', data };
  }

  @Get(':id')
  @Permissions('shipping_methods.read')
  @ApiOperation({ summary: 'Get shipping method by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { message: 'Shipping method fetched successfully', data };
  }

  @Patch(':id')
  @Permissions('shipping_methods.update')
  @ApiOperation({ summary: 'Update a shipping method' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateShippingMethodDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.service.update(id, dto, user?.id);
    return { message: 'Shipping method updated successfully', data };
  }

  @Delete(':id')
  @Permissions('shipping_methods.delete')
  @ApiOperation({ summary: 'Delete a shipping method' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.service.remove(id, user?.id);
    return { message: 'Shipping method deleted successfully', data };
  }
}
