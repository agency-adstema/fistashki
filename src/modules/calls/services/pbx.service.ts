import { Injectable, Logger } from '@nestjs/common';

export interface IPbxService {
  initiateCall(phoneNumber: string, callJobId: string): Promise<string>;
  hangupCall(callId: string): Promise<void>;
  sendAudio(callId: string, audioData: Buffer): Promise<void>;
  getCallStatus(callId: string): Promise<string>;
}

@Injectable()
export class PbxService implements IPbxService {
  private readonly logger = new Logger(PbxService.name);

  // TODO: Yeastar PBX konfiguracija iz .env
  private yeastarHost = process.env.YEASTAR_HOST || 'localhost';
  private yeastarPort = process.env.YEASTAR_PORT || '8088';
  private yeastarUsername = process.env.YEASTAR_USERNAME || 'admin';
  private yeastarPassword = process.env.YEASTAR_PASSWORD || 'admin';

  async initiateCall(phoneNumber: string, callJobId: string): Promise<string> {
    try {
      this.logger.log(`[MOCK] Initiating call to ${phoneNumber}`);

      // TODO: Implementiraj Yeastar REST API poziv
      // const response = await fetch(`http://${this.yeastarHost}:${this.yeastarPort}/api/...`);

      // Za sada, return mock ID
      return `call_${callJobId}`;
    } catch (error) {
      this.logger.error(`Error initiating call: ${error.message}`);
      throw error;
    }
  }

  async hangupCall(callId: string): Promise<void> {
    try {
      this.logger.log(`[MOCK] Hanging up call ${callId}`);
      // TODO: Implementiraj Yeastar hangup
    } catch (error) {
      this.logger.error(`Error hanging up call: ${error.message}`);
      throw error;
    }
  }

  async sendAudio(callId: string, audioData: Buffer): Promise<void> {
    try {
      // TODO: Implementiraj audio streaming ka Yeastar-u
      this.logger.debug(`[MOCK] Sending audio to call ${callId}`);
    } catch (error) {
      this.logger.error(`Error sending audio: ${error.message}`);
      throw error;
    }
  }

  async getCallStatus(callId: string): Promise<string> {
    try {
      // TODO: Implementiraj status polling
      return 'active';
    } catch (error) {
      this.logger.error(`Error getting call status: ${error.message}`);
      throw error;
    }
  }
}
