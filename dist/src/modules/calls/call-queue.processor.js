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
var CallQueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallQueueProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const call_manager_service_1 = require("./services/call-manager.service");
let CallQueueProcessor = CallQueueProcessor_1 = class CallQueueProcessor extends bullmq_1.WorkerHost {
    callManagerService;
    logger = new common_1.Logger(CallQueueProcessor_1.name);
    constructor(callManagerService) {
        super();
        this.callManagerService = callManagerService;
    }
    async process(job) {
        const { callJobId, orderId } = job.data;
        try {
            this.logger.log(`Processing call job: ${callJobId}`);
            const result = await this.callManagerService.processCall(callJobId, orderId);
            return result;
        }
        catch (error) {
            this.logger.error(`Call processing failed: ${error.message}`);
            throw error;
        }
    }
};
exports.CallQueueProcessor = CallQueueProcessor;
exports.CallQueueProcessor = CallQueueProcessor = CallQueueProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('calls'),
    __metadata("design:paramtypes", [call_manager_service_1.CallManagerService])
], CallQueueProcessor);
//# sourceMappingURL=call-queue.processor.js.map