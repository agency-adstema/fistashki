import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CallManagerService } from './services/call-manager.service';

@Processor('calls')
export class CallQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(CallQueueProcessor.name);

  constructor(private callManagerService: CallManagerService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { callJobId, orderId } = job.data;

    try {
      this.logger.log(`Processing call job: ${callJobId}`);

      const result = await this.callManagerService.processCall(
        callJobId,
        orderId,
      );

      return result;
    } catch (error) {
      this.logger.error(`Call processing failed: ${error.message}`);
      throw error;
    }
  }
}
