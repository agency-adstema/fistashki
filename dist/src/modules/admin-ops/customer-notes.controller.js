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
exports.CustomerNotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const notes_service_1 = require("./notes.service");
const create_note_dto_1 = require("./dto/create-note.dto");
const update_note_dto_1 = require("./dto/update-note.dto");
let CustomerNotesController = class CustomerNotesController {
    notesService;
    constructor(notesService) {
        this.notesService = notesService;
    }
    async create(id, dto, req) {
        const data = await this.notesService.createCustomerNote(id, dto, req.user?.id);
        return { data };
    }
    async findAll(id) {
        const data = await this.notesService.listCustomerNotes(id);
        return { data };
    }
    async update(id, noteId, dto, req) {
        const data = await this.notesService.updateCustomerNote(id, noteId, dto, req.user?.id);
        return { data };
    }
    async remove(id, noteId, req) {
        const data = await this.notesService.deleteCustomerNote(id, noteId, req.user?.id);
        return { data };
    }
    async pin(id, noteId, req) {
        const data = await this.notesService.pinCustomerNote(id, noteId, req.user?.id);
        return { data };
    }
    async unpin(id, noteId, req) {
        const data = await this.notesService.unpinCustomerNote(id, noteId, req.user?.id);
        return { data };
    }
};
exports.CustomerNotesController = CustomerNotesController;
__decorate([
    (0, common_1.Post)(':id/notes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_decorator_1.Permissions)('customer_notes.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Add internal note to customer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_note_dto_1.CreateNoteDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerNotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/notes'),
    (0, permissions_decorator_1.Permissions)('customer_notes.read'),
    (0, swagger_1.ApiOperation)({ summary: 'List all notes for customer' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerNotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/notes/:noteId'),
    (0, permissions_decorator_1.Permissions)('customer_notes.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a customer note' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_note_dto_1.UpdateNoteDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerNotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id/notes/:noteId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('customer_notes.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a customer note' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CustomerNotesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/notes/:noteId/pin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('customer_notes.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Pin a customer note' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CustomerNotesController.prototype, "pin", null);
__decorate([
    (0, common_1.Post)(':id/notes/:noteId/unpin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)('customer_notes.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Unpin a customer note' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CustomerNotesController.prototype, "unpin", null);
exports.CustomerNotesController = CustomerNotesController = __decorate([
    (0, swagger_1.ApiTags)('Customer Notes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [notes_service_1.NotesService])
], CustomerNotesController);
//# sourceMappingURL=customer-notes.controller.js.map