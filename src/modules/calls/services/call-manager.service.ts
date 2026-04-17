import { Injectable, Logger } from '@nestjs/common';
import { CallStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PbxService } from './pbx.service';

@Injectable()
export class CallManagerService {
  private readonly logger = new Logger(CallManagerService.name);

  constructor(
    private prisma: PrismaService,
    private pbxService: PbxService,
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

      // TODO: Pozovi PBX da inicira poziv
      // const callId = await this.pbxService.initiateCall(
      //   order.customer.phone,
      //   callJobId,
      // );

      // Za sada, simuliraj uspešan poziv nakon 5 sekundi
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Kreiraj call log sa mock-om
      const callLog = await this.prisma.callLog.create({
        data: {
          callJobId,
          orderId,
          customerId: order.customerId,
          duration: 300,
          outcome: 'CONFIRMED',
          transcript: [
            {
              role: 'ai',
              text: 'Hello, this is a test call',
              timestamp: 0,
            },
            {
              role: 'customer',
              text: 'Hi there',
              timestamp: 2,
            },
          ],
          summary:
            'Customer confirmed the order. Order #' + order.orderNumber,
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
