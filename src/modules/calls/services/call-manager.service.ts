import { Injectable, Logger } from '@nestjs/common';
import { CallStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PbxService } from './pbx.service';
import { OpenAIService } from './openai.service';

@Injectable()
export class CallManagerService {
  private readonly logger = new Logger(CallManagerService.name);

  constructor(
    private prisma: PrismaService,
    private pbxService: PbxService,
    private openaiService: OpenAIService,
  ) {}

  async processCall(callJobId: string, orderId: string) {
    try {
      // Učitaj order i customer
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          items: true,
        },
      });

      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        return;
      }

      // Update call job status
      await this.prisma.callJob.update({
        where: { id: callJobId },
        data: {
          status: CallStatus.DIALING,
          startedAt: new Date(),
        },
      });

      this.logger.log(
        `Starting call for order ${orderId}, customer: ${order.customer.phone}`,
      );

      // Koristi OpenAI za AI razgovor
      const callResult = await this.openaiService.simulateCall({
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        total: parseFloat(String(order.grandTotal)),
        currency: order.currency,
        items: order.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: parseFloat(String(item.unitPrice)),
        })),
      });

      // Kreiraj call log sa OpenAI rezultatima
      const callLog = await this.prisma.callLog.create({
        data: {
          callJobId,
          orderId,
          customerId: order.customerId,
          duration: callResult.duration,
          outcome: callResult.outcome,
          transcript: callResult.transcript as any, // JSON type
          summary: callResult.summary,
        },
      });

      // Update call job
      await this.prisma.callJob.update({
        where: { id: callJobId },
        data: {
          status: CallStatus.COMPLETED,
          endedAt: new Date(),
        },
      });

      this.logger.log(`Call completed for order ${orderId}`);
      return callLog;
    } catch (error) {
      this.logger.error(`Error processing call: ${error.message}`);

      // Update call job sa error
      await this.prisma.callJob.update({
        where: { id: callJobId },
        data: {
          status: CallStatus.FAILED,
          error: error.message,
          endedAt: new Date(),
        },
      });

      throw error;
    }
  }
}
