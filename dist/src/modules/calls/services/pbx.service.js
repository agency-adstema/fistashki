"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PbxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PbxService = void 0;
const common_1 = require("@nestjs/common");
let PbxService = PbxService_1 = class PbxService {
    logger = new common_1.Logger(PbxService_1.name);
    yeastarHost = process.env.YEASTAR_HOST || 'localhost';
    yeastarPort = process.env.YEASTAR_PORT || '8088';
    yeastarUsername = process.env.YEASTAR_USERNAME || 'admin';
    yeastarPassword = process.env.YEASTAR_PASSWORD || 'admin';
    async initiateCall(phoneNumber, callJobId) {
        try {
            this.logger.log(`[MOCK] Initiating call to ${phoneNumber}`);
            return `call_${callJobId}`;
        }
        catch (error) {
            this.logger.error(`Error initiating call: ${error.message}`);
            throw error;
        }
    }
    async hangupCall(callId) {
        try {
            this.logger.log(`[MOCK] Hanging up call ${callId}`);
        }
        catch (error) {
            this.logger.error(`Error hanging up call: ${error.message}`);
            throw error;
        }
    }
    async sendAudio(callId, audioData) {
        try {
            this.logger.debug(`[MOCK] Sending audio to call ${callId}`);
        }
        catch (error) {
            this.logger.error(`Error sending audio: ${error.message}`);
            throw error;
        }
    }
    async getCallStatus(callId) {
        try {
            return 'active';
        }
        catch (error) {
            this.logger.error(`Error getting call status: ${error.message}`);
            throw error;
        }
    }
};
exports.PbxService = PbxService;
exports.PbxService = PbxService = PbxService_1 = __decorate([
    (0, common_1.Injectable)()
], PbxService);
//# sourceMappingURL=pbx.service.js.map