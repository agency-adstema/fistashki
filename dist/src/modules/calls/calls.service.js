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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CallsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let CallsService = CallsService_1 = class CallsService {
    callsQueue;
    prisma;
    auditLogsService;
    logger = new common_1.Logger(CallsService_1.name);
    constructor(callsQueue, prisma, auditLogsService) {
        this.callsQueue = callsQueue;
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async scheduleCall(orderId, delaySeconds = 30) {
        try {
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
            const callJob = await this.prisma.callJob.create({
                data: {
                    orderId,
                    status: client_1.CallStatus.SCHEDULED,
                    scheduledAt: new Date(Date.now() + delaySeconds * 1000),
                },
            });
            await this.callsQueue.add('process-call', { callJobId: callJob.id, orderId }, {
                delay: delaySeconds * 1000,
                jobId: callJob.id,
            });
            this.logger.log(`Call scheduled for order ${orderId}, jobId: ${callJob.id}`);
            return callJob;
        }
        catch (error) {
            this.logger.error(`Error scheduling call: ${error.message}`);
            throw error;
        }
    }
    async getCallLog(callJobId) {
        return this.prisma.callLog.findUnique({
            where: { callJobId },
            include: {
                callJob: true,
                order: true,
                customer: true,
            },
        });
    }
    async getCallsByCustomer(customerId) {
        return this.prisma.callLog.findMany({
            where: { customerId },
            include: {
                callJob: true,
                order: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCallsByOrder(orderId) {
        return this.prisma.callLog.findMany({
            where: { orderId },
            include: {
                callJob: true,
                customer: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllCalls(page = 1, limit = 50) {
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
        const confirmed = callLogs.filter((c) => c.outcome === client_1.CallOutcome.CONFIRMED).length;
        const upsells = callLogs.filter((c) => c.outcome === client_1.CallOutcome.UPSELL).length;
        const failed = callLogs.filter((c) => c.outcome === client_1.CallOutcome.FAILED).length;
        const noAnswer = callLogs.filter((c) => c.outcome === client_1.CallOutcome.NO_ANSWER).length;
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
    async retryCall(callJobId, actorUserId) {
        const callJob = await this.prisma.callJob.findUnique({
            where: { id: callJobId },
        });
        if (!callJob) {
            throw new Error('Call job not found');
        }
        if (callJob.attempt >= callJob.maxAttempts) {
            throw new Error(`Max retry attempts (${callJob.maxAttempts}) reached`);
        }
        const newCallJob = await this.prisma.callJob.update({
            where: { id: callJobId },
            data: {
                attempt: callJob.attempt + 1,
                status: client_1.CallStatus.SCHEDULED,
                scheduledAt: new Date(Date.now() + 30000),
            },
        });
        await this.callsQueue.add('process-call', { callJobId: newCallJob.id, orderId: newCallJob.orderId }, {
            delay: 30000,
            jobId: newCallJob.id,
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'call.retry',
            entityType: 'CallJob',
            entityId: callJobId,
            metadata: { attempt: newCallJob.attempt },
        });
        return newCallJob;
    }
};
exports.CallsService = CallsService;
exports.CallsService = CallsService = CallsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('calls')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], CallsService);
//# sourceMappingURL=calls.service.js.map