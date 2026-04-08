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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const mark_paid_dto_1 = require("./dto/mark-paid.dto");
const mark_failed_dto_1 = require("./dto/mark-failed.dto");
const refund_payment_dto_1 = require("./dto/refund-payment.dto");
const payments_query_dto_1 = require("./dto/payments-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async create(dto, user) {
        const data = await this.paymentsService.create(dto, user?.id);
        return { message: 'Payment created successfully', data };
    }
    async findAll(query) {
        const data = await this.paymentsService.findAll(query);
        return { message: 'Payments fetched successfully', data };
    }
    async findOne(id) {
        const data = await this.paymentsService.findOne(id);
        return { message: 'Payment fetched successfully', data };
    }
    async markPaid(id, dto, user) {
        const data = await this.paymentsService.markPaid(id, dto, user?.id);
        return { message: 'Payment marked as paid', data };
    }
    async markFailed(id, dto, user) {
        const data = await this.paymentsService.markFailed(id, dto, user?.id);
        return { message: 'Payment marked as failed', data };
    }
    async refund(id, dto, user) {
        const data = await this.paymentsService.refund(id, dto, user?.id);
        return { message: 'Payment refunded successfully', data };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('payments.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a payment record for an order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('payments.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List payments (paginated, filterable)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_query_dto_1.PaymentsQueryDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('payments.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/mark-paid'),
    (0, permissions_decorator_1.Permissions)('payments.mark_paid'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a payment as paid and sync order payment status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, mark_paid_dto_1.MarkPaidDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Post)(':id/mark-failed'),
    (0, permissions_decorator_1.Permissions)('payments.mark_failed'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a payment as failed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, mark_failed_dto_1.MarkFailedDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "markFailed", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, permissions_decorator_1.Permissions)('payments.refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a payment fully or partially' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, refund_payment_dto_1.RefundPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refund", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map