import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  isConnected() {
    return this.connected;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Prisma connected');
    } catch (e) {
      this.connected = false;
      // IMPORTANT: do not crash the whole API on boot if DB is not ready.
      // Endpoints will fail with a clear 503 until DATABASE_URL is correct.
      this.logger.error(
        `Prisma connect failed (API will still start): ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
