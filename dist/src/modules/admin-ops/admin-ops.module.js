"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOpsModule = void 0;
const common_1 = require("@nestjs/common");
const notes_service_1 = require("./notes.service");
const tags_service_1 = require("./tags.service");
const admin_ops_service_1 = require("./admin-ops.service");
const order_notes_controller_1 = require("./order-notes.controller");
const customer_notes_controller_1 = require("./customer-notes.controller");
const order_tags_controller_1 = require("./order-tags.controller");
const order_admin_controller_1 = require("./order-admin.controller");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
let AdminOpsModule = class AdminOpsModule {
};
exports.AdminOpsModule = AdminOpsModule;
exports.AdminOpsModule = AdminOpsModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_logs_module_1.AuditLogsModule],
        providers: [notes_service_1.NotesService, tags_service_1.TagsService, admin_ops_service_1.AdminOpsService],
        controllers: [
            order_notes_controller_1.OrderNotesController,
            customer_notes_controller_1.CustomerNotesController,
            order_tags_controller_1.OrderTagsController,
            order_admin_controller_1.OrderAdminController,
        ],
        exports: [notes_service_1.NotesService, tags_service_1.TagsService, admin_ops_service_1.AdminOpsService],
    })
], AdminOpsModule);
//# sourceMappingURL=admin-ops.module.js.map