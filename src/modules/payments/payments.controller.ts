import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { MarkFailedDto } from './dto/mark-failed.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsQueryDto } from './dto/payments-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('payments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Permissions('payments.create')
  @ApiOperation({ summary: 'Create a payment record for an order' })
  async create(@Body() dto: CreatePaymentDto, @CurrentUser() user: any) {
    const data = await this.paymentsService.create(dto, user?.id);
    return { message: 'Payment created successfully', data };
  }

  @Get()
  @Permissions('payments.read')
  @ApiOperation({ summary: 'List payments (paginated, filterable)' })
  async findAll(@Query() query: PaymentsQueryDto) {
    const data = await this.paymentsService.findAll(query);
    return { message: 'Payments fetched successfully', data };
  }

  @Get(':id')
  @Permissions('payments.read')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.paymentsService.findOne(id);
    return { message: 'Payment fetched successfully', data };
  }

  @Post(':id/mark-paid')
  @Permissions('payments.mark_paid')
  @ApiOperation({ summary: 'Mark a payment as paid and sync order payment status' })
  async markPaid(
    @Param('id') id: string,
    @Body() dto: MarkPaidDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.paymentsService.markPaid(id, dto, user?.id);
    return { message: 'Payment marked as paid', data };
  }

  @Post(':id/mark-failed')
  @Permissions('payments.mark_failed')
  @ApiOperation({ summary: 'Mark a payment as failed' })
  async markFailed(
    @Param('id') id: string,
    @Body() dto: MarkFailedDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.paymentsService.markFailed(id, dto, user?.id);
    return { message: 'Payment marked as failed', data };
  }

  @Post(':id/refund')
  @Permissions('payments.refund')
  @ApiOperation({ summary: 'Refund a payment fully or partially' })
  async refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.paymentsService.refund(id, dto, user?.id);
    return { message: 'Payment refunded successfully', data };
  }
}
