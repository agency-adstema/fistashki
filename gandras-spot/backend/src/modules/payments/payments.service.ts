import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key) this.stripe = new Stripe(key);
  }

  async createIntent(orderId: string) {
    if (!this.stripe) throw new BadRequestException('Stripe not configured');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const intent = await this.stripe.paymentIntents.create({
      amount: order.total,
      currency: 'rsd',
      metadata: { orderId: order.id, restaurantId: order.restaurantId },
      automatic_payment_methods: { enabled: true },
    });

    await this.prisma.payment.upsert({
      where: { orderId: order.id },
      update: { stripePaymentIntentId: intent.id, status: PaymentStatus.PENDING },
      create: {
        orderId: order.id,
        stripePaymentIntentId: intent.id,
        amount: order.total,
        status: PaymentStatus.PENDING,
      },
    });

    return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) return { received: true };

    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new BadRequestException('Webhook secret not configured');

    const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await this.markPaid(intent.id, intent.latest_charge as string);
    }
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await this.markFailed(intent.id);
    }

    return { received: true };
  }

  private async markPaid(paymentIntentId: string, chargeId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { order: true },
    });
    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PAID, stripeChargeId: chargeId ?? undefined },
    });
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  }

  private async markFailed(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: PaymentStatus.FAILED },
    });
  }
}
