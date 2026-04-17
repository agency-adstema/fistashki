"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AudioConverterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioConverterService = void 0;
const common_1 = require("@nestjs/common");
let AudioConverterService = AudioConverterService_1 = class AudioConverterService {
    logger = new common_1.Logger(AudioConverterService_1.name);
    async convertToPcm24k(inputBuffer) {
        this.logger.debug('[MOCK] Converting audio to PCM 24kHz');
        return inputBuffer;
    }
    async convertToUlaw(inputBuffer) {
        this.logger.debug('[MOCK] Converting audio to ulaw');
        return inputBuffer;
    }
};
exports.AudioConverterService = AudioConverterService;
exports.AudioConverterService = AudioConverterService = AudioConverterService_1 = __decorate([
    (0, common_1.Injectable)()
], AudioConverterService);
//# sourceMappingURL=audio-converter.service.js.map