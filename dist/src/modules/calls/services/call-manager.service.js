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
var CallManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallManagerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../prisma/prisma.service");
const pbx_service_1 = require("./pbx.service");
const openai_service_1 = require("./openai.service");
let CallManagerService = CallManagerService_1 = class CallManagerService {
    prisma;
    pbxService;
    openaiService;
    logger = new common_1.Logger(CallManagerService_1.name);
    constructor(prisma, pbxService, openaiService) {
        this.prisma = prisma;
        this.pbxService = pbxService;
        this.openaiService = openaiService;
    }
    async processCall(callJobId, orderId) {
        try {
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
            await this.prisma.callJob.update({
                where: { id: callJobId },
                data: {
                    status: client_1.CallStatus.DIALING,
                    startedAt: new Date(),
                },
            });
            this.logger.log(`Starting call for order ${orderId}, customer: ${order.customer.phone}`);
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
            const callLog = await this.prisma.callLog.create({
                data: {
                    callJobId,
                    orderId,
                    customerId: order.customerId,
                    duration: callResult.duration,
                    outcome: callResult.outcome,
                    transcript: callResult.transcript,
                    summary: callResult.summary,
                },
            });
            await this.prisma.callJob.update({
                where: { id: callJobId },
                data: {
                    status: client_1.CallStatus.COMPLETED,
                    endedAt: new Date(),
                },
            });
            this.logger.log(`Call completed for order ${orderId}`);
            return callLog;
        }
        catch (error) {
            this.logger.error(`Error processing call: ${error.message}`);
            await this.prisma.callJob.update({
                where: { id: callJobId },
                data: {
                    status: client_1.CallStatus.FAILED,
                    error: error.message,
                    endedAt: new Date(),
                },
            });
            throw error;
        }
    }
};
exports.CallManagerService = CallManagerService;
exports.CallManagerService = CallManagerService = CallManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pbx_service_1.PbxService,
        openai_service_1.OpenAIService])
], CallManagerService);
//# sourceMappingURL=call-manager.service.js.map