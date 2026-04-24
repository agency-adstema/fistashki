"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const calls_service_1 = require("./calls.service");
const calls_controller_1 = require("./calls.controller");
const call_queue_processor_1 = require("./call-queue.processor");
const call_manager_service_1 = require("./services/call-manager.service");
const pbx_service_1 = require("./services/pbx.service");
const audio_converter_service_1 = require("./services/audio-converter.service");
const openai_service_1 = require("./services/openai.service");
const realtime_call_gateway_1 = require("./realtime-call.gateway");
const prisma_module_1 = require("../../prisma/prisma.module");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
const orders_module_1 = require("../orders/orders.module");
let CallsModule = class CallsModule {
};
exports.CallsModule = CallsModule;
exports.CallsModule = CallsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'calls',
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            }),
            prisma_module_1.PrismaModule,
            audit_logs_module_1.AuditLogsModule,
            (0, common_1.forwardRef)(() => orders_module_1.OrdersModule),
        ],
        providers: [
            calls_service_1.CallsService,
            call_queue_processor_1.CallQueueProcessor,
            call_manager_service_1.CallManagerService,
            pbx_service_1.PbxService,
            audio_converter_service_1.AudioConverterService,
            openai_service_1.OpenAIService,
            realtime_call_gateway_1.RealtimeCallGateway,
        ],
        controllers: [calls_controller_1.CallsController],
        exports: [calls_service_1.CallsService],
    })
], CallsModule);
//# sourceMappingURL=calls.module.js.map