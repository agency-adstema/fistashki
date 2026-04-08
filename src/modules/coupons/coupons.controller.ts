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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponsQueryDto } from './dto/coupons-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('coupons')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Permissions('coupons.create')
  @ApiOperation({ summary: 'Create a coupon' })
  async create(@Body() dto: CreateCouponDto, @CurrentUser() user: any) {
    const data = await this.couponsService.create(dto, user?.id);
    return { message: 'Coupon created successfully', data };
  }

  @Get()
  @Permissions('coupons.read')
  @ApiOperation({ summary: 'List coupons (paginated, filterable)' })
  async findAll(@Query() query: CouponsQueryDto) {
    const data = await this.couponsService.findAll(query);
    return { message: 'Coupons fetched successfully', data };
  }

  @Get(':id')
  @Permissions('coupons.read')
  @ApiOperation({ summary: 'Get coupon by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.couponsService.findOne(id);
    return { message: 'Coupon fetched successfully', data };
  }

  @Patch(':id')
  @Permissions('coupons.update')
  @ApiOperation({ summary: 'Update a coupon' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.couponsService.update(id, dto, user?.id);
    return { message: 'Coupon updated successfully', data };
  }

  @Delete(':id')
  @Permissions('coupons.delete')
  @ApiOperation({ summary: 'Delete a coupon' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.couponsService.remove(id, user?.id);
    return { message: 'Coupon deleted successfully', data };
  }
}
