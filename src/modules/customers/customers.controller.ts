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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CustomersQueryDto } from './dto/customers-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('customers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions('customers.create')
  @ApiOperation({ summary: 'Create a new customer' })
  async create(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    const data = await this.customersService.create(dto, user?.id);
    return { message: 'Customer created successfully', data };
  }

  @Get()
  @Permissions('customers.read')
  @ApiOperation({ summary: 'Get all customers (paginated, searchable, filterable)' })
  async findAll(@Query() query: CustomersQueryDto) {
    const data = await this.customersService.findAll(query);
    return { message: 'Customers fetched successfully', data };
  }

  @Get(':id')
  @Permissions('customers.read')
  @ApiOperation({ summary: 'Get customer by ID (includes addresses and order summary)' })
  async findOne(@Param('id') id: string) {
    const data = await this.customersService.findOne(id);
    return { message: 'Customer fetched successfully', data };
  }

  @Patch(':id')
  @Permissions('customers.update')
  @ApiOperation({ summary: 'Update a customer' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.customersService.update(id, dto, user?.id);
    return { message: 'Customer updated successfully', data };
  }

  @Post(':customerId/addresses')
  @Permissions('customers.update')
  @ApiOperation({ summary: 'Add an address to a customer' })
  async addAddress(
    @Param('customerId') customerId: string,
    @Body() dto: CreateAddressDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.customersService.addAddress(customerId, dto, user?.id);
    return { message: 'Address added successfully', data };
  }

  @Get(':customerId/addresses')
  @Permissions('customers.read')
  @ApiOperation({ summary: 'Get all addresses for a customer' })
  async getAddresses(@Param('customerId') customerId: string) {
    const data = await this.customersService.getAddresses(customerId);
    return { message: 'Addresses fetched successfully', data };
  }

  @Patch(':customerId/addresses/:addressId')
  @Permissions('customers.update')
  @ApiOperation({ summary: 'Update a customer address' })
  async updateAddress(
    @Param('customerId') customerId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.customersService.updateAddress(customerId, addressId, dto, user?.id);
    return { message: 'Address updated successfully', data };
  }

  @Delete(':customerId/addresses/:addressId')
  @Permissions('customers.update')
  @ApiOperation({ summary: 'Delete a customer address' })
  async deleteAddress(
    @Param('customerId') customerId: string,
    @Param('addressId') addressId: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.customersService.deleteAddress(customerId, addressId, user?.id);
    return { message: 'Address deleted successfully', data };
  }
}
