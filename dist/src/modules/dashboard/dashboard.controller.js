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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary() {
        const data = await this.dashboardService.getSummary();
        return { message: 'Dashboard summary fetched successfully', data };
    }
    async getLowStock() {
        const data = await this.dashboardService.getLowStock();
        return { message: 'Low stock products fetched successfully', data };
    }
    async getRecentActivity(limit) {
        const cap = Math.min(Number(limit ?? 20), 50);
        const data = await this.dashboardService.getRecentActivity(cap);
        return { message: 'Recent activity fetched successfully', data };
    }
    async getRevenueTrend(period) {
        const validPeriod = ['7d', '30d', '90d'].includes(period)
            ? period
            : '30d';
        const data = await this.dashboardService.getRevenueTrend(validPeriod);
        return { message: 'Revenue trend fetched successfully', data };
    }
    async getTopProducts(limit) {
        const data = await this.dashboardService.getTopProducts(Math.min(limit, 50));
        return { message: 'Top products fetched successfully', data };
    }
    async getTopCustomers(limit) {
        const data = await this.dashboardService.getTopCustomers(Math.min(limit, 50));
        return { message: 'Top customers fetched successfully', data };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, permissions_decorator_1.Permissions)('dashboard.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard summary metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, permissions_decorator_1.Permissions)('dashboard.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get products below or at low stock threshold' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('recent-activity'),
    (0, permissions_decorator_1.Permissions)('audit_logs.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent audit log activity (latest 20)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Get)('revenue-trend'),
    (0, permissions_decorator_1.Permissions)('dashboard.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily revenue and order trend for a period' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['7d', '30d', '90d'] }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRevenueTrend", null);
__decorate([
    (0, common_1.Get)('top-products'),
    (0, permissions_decorator_1.Permissions)('dashboard.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top products by revenue from paid orders' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, permissions_decorator_1.Permissions)('dashboard.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top customers by total spend on paid orders' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTopCustomers", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map