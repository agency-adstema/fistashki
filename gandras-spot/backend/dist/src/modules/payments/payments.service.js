"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.stripe = null;
        const key = this.config.get('STRIPE_SECRET_KEY');
        if (key)
            this.stripe = new stripe_1.default(key);
    }
    async createIntent(orderId) {
        if (!this.stripe)
            throw new common_1.BadRequestException('Stripe not configured');
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const intent = await this.stripe.paymentIntents.create({
            amount: order.total,
            currency: 'rsd',
            metadata: { orderId: order.id, restaurantId: order.restaurantId },
            automatic_payment_methods: { enabled: true },
        });
        await this.prisma.payment.upsert({
            where: { orderId: order.id },
            update: { stripePaymentIntentId: intent.id, status: client_1.PaymentStatus.PENDING },
            create: {
                orderId: order.id,
                stripePaymentIntentId: intent.id,
                amount: order.total,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
    }
    async handleWebhook(rawBody, signature) {
        if (!this.stripe)
            return { received: true };
        const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!secret)
            throw new common_1.BadRequestException('Webhook secret not configured');
        const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
        if (event.type === 'payment_intent.succeeded') {
            const intent = event.data.object;
            await this.markPaid(intent.id, intent.latest_charge);
        }
        if (event.type === 'payment_intent.payment_failed') {
            const intent = event.data.object;
            await this.markFailed(intent.id);
        }
        return { received: true };
    }
    async markPaid(paymentIntentId, chargeId) {
        const payment = await this.prisma.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
            include: { order: true },
        });
        if (!payment)
            return;
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: client_1.PaymentStatus.PAID, stripeChargeId: chargeId ?? undefined },
        });
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: client_1.PaymentStatus.PAID },
        });
    }
    async markFailed(paymentIntentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
        });
        if (!payment)
            return;
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: client_1.PaymentStatus.FAILED },
        });
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: client_1.PaymentStatus.FAILED },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map