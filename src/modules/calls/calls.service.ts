import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CallStatus, CallOutcome } from '@prisma/client';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    @InjectQueue('calls') private callsQueue: Queue,
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async scheduleCall(orderId: string, delaySeconds: number = 30) {
    try {
      // Proveri da li order postoji
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
      });

      if (!order) {
        this.logger.warn(`Order not found: ${orderId}`);
        return;
      }

      if (!order.customer.phone) {
        this.logger.warn(`Customer has no phone number: ${order.customerId}`);
        return;
      }

      // Kreiraj CallJob
      const callJob = await this.prisma.callJob.create({
        data: {
          orderId,
          status: CallStatus.SCHEDULED,
          scheduledAt: new Date(Date.now() + delaySeconds * 1000),
        },
      });

      // Dodaj u BullMQ queue sa delayom
      await this.callsQueue.add(
        'process-call',
        { callJobId: callJob.id, orderId },
        {
          delay: delaySeconds * 1000,
          jobId: callJob.id,
        },
      );

      this.logger.log(
        `Call scheduled for order ${orderId}, jobId: ${callJob.id}`,
      );
      return callJob;
    } catch (error) {
      this.logger.error(`Error scheduling call: ${error.message}`);
      throw error;
    }
  }

  async getCallLog(id: string) {
    return this.prisma.callLog.findUnique({
      where: { id },
      include: {
        callJob: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            currency: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async getCallsByCustomer(customerId: string) {
    return this.prisma.callLog.findMany({
      where: { customerId },
      include: {
        callJob: true,
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCallsByOrder(orderId: string) {
    return this.prisma.callLog.findMany({
      where: { orderId },
      include: {
        callJob: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllCalls(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.callLog.findMany({
        skip,
        take: limit,
        include: {
          callJob: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              grandTotal: true,
              currency: true,
            },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.callLog.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getCallStats() {
    const callLogs = await this.prisma.callLog.findMany();

    const total = callLogs.length;
    const confirmed = callLogs.filter(
      (c) => c.outcome === CallOutcome.CONFIRMED,
    ).length;
    const upsells = callLogs.filter(
      (c) => c.outcome === CallOutcome.UPSELL,
    ).length;
    const failed = callLogs.filter((c) => c.outcome === CallOutcome.FAILED).length;
    const noAnswer = callLogs.filter(
      (c) => c.outcome === CallOutcome.NO_ANSWER,
    ).length;

    return {
      total,
      confirmed: {
        count: confirmed,
        percentage: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      },
      upsells: {
        count: upsells,
        percentage: total > 0 ? Math.round((upsells / total) * 100) : 0,
      },
      failed: {
        count: failed,
        percentage: total > 0 ? Math.round((failed / total) * 100) : 0,
      },
      noAnswer: {
        count: noAnswer,
        percentage: total > 0 ? Math.round((noAnswer / total) * 100) : 0,
      },
    };
  }

  async retryCall(callJobId: string, actorUserId?: string) {
    const callJob = await this.prisma.callJob.findUnique({
      where: { id: callJobId },
    });

    if (!callJob) {
      throw new Error('Call job not found');
    }

    if (callJob.attempt >= callJob.maxAttempts) {
      throw new Error(
        `Max retry attempts (${callJob.maxAttempts}) reached`,
      );
    }

    // Kreiraj novi job sa +1 attempt
    const newCallJob = await this.prisma.callJob.update({
      where: { id: callJobId },
      data: {
        attempt: callJob.attempt + 1,
        status: CallStatus.SCHEDULED,
        scheduledAt: new Date(Date.now() + 30000), // 30 sec delay
      },
    });

    // Dodaj u queue
    await this.callsQueue.add(
      'process-call',
      { callJobId: newCallJob.id, orderId: newCallJob.orderId },
      {
        delay: 30000,
        jobId: newCallJob.id,
      },
    );

    await this.auditLogsService.log({
      actorUserId,
      action: 'call.retry',
      entityType: 'CallJob',
      entityId: callJobId,
      metadata: { attempt: newCallJob.attempt },
    });

    return newCallJob;
  }
}
