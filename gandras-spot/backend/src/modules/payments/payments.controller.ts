import { Body, Controller, Post, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('stripe/create-intent')
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  createIntent(@Body('orderId') orderId: string) {
    return this.payments.createIntent(orderId).then((data) => ({ success: true, data }));
  }
}

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private payments: PaymentsService) {}

  @Post('stripe')
  stripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.payments.handleWebhook(req.rawBody as Buffer, signature);
  }
}
