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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const NOTE_AUTHOR_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};
let NotesService = class NotesService {
    prisma;
    auditLogsService;
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async createOrderNote(orderId, dto, actorUserId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const note = await this.prisma.orderNote.create({
            data: {
                orderId,
                authorUserId: actorUserId ?? null,
                content: dto.content,
                isPinned: dto.isPinned ?? false,
            },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.note.created',
            entityType: 'OrderNote',
            entityId: note.id,
            metadata: { orderId, content: note.content.substring(0, 200), isPinned: note.isPinned },
        });
        return note;
    }
    async listOrderNotes(orderId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.orderNote.findMany({
            where: { orderId },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async updateOrderNote(orderId, noteId, dto, actorUserId) {
        const note = await this.prisma.orderNote.findFirst({
            where: { id: noteId, orderId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        const updated = await this.prisma.orderNote.update({
            where: { id: noteId },
            data: {
                ...(dto.content != null && { content: dto.content }),
                ...(dto.isPinned != null && { isPinned: dto.isPinned }),
            },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.note.updated',
            entityType: 'OrderNote',
            entityId: noteId,
            metadata: { orderId, changes: dto },
        });
        return updated;
    }
    async deleteOrderNote(orderId, noteId, actorUserId) {
        const note = await this.prisma.orderNote.findFirst({
            where: { id: noteId, orderId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        await this.prisma.orderNote.delete({ where: { id: noteId } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'order.note.deleted',
            entityType: 'OrderNote',
            entityId: noteId,
            metadata: { orderId },
        });
        return { deleted: true };
    }
    async pinOrderNote(orderId, noteId, actorUserId) {
        const note = await this.prisma.orderNote.findFirst({
            where: { id: noteId, orderId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        return this.prisma.orderNote.update({
            where: { id: noteId },
            data: { isPinned: true },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
    }
    async unpinOrderNote(orderId, noteId, actorUserId) {
        const note = await this.prisma.orderNote.findFirst({
            where: { id: noteId, orderId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        return this.prisma.orderNote.update({
            where: { id: noteId },
            data: { isPinned: false },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
    }
    async createCustomerNote(customerId, dto, actorUserId) {
        const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const note = await this.prisma.customerNote.create({
            data: {
                customerId,
                authorUserId: actorUserId ?? null,
                content: dto.content,
                isPinned: dto.isPinned ?? false,
            },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customer.note.created',
            entityType: 'CustomerNote',
            entityId: note.id,
            metadata: { customerId, content: note.content.substring(0, 200) },
        });
        return note;
    }
    async listCustomerNotes(customerId) {
        const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return this.prisma.customerNote.findMany({
            where: { customerId },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async updateCustomerNote(customerId, noteId, dto, actorUserId) {
        const note = await this.prisma.customerNote.findFirst({
            where: { id: noteId, customerId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        const updated = await this.prisma.customerNote.update({
            where: { id: noteId },
            data: {
                ...(dto.content != null && { content: dto.content }),
                ...(dto.isPinned != null && { isPinned: dto.isPinned }),
            },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customer.note.updated',
            entityType: 'CustomerNote',
            entityId: noteId,
            metadata: { customerId, changes: dto },
        });
        return updated;
    }
    async deleteCustomerNote(customerId, noteId, actorUserId) {
        const note = await this.prisma.customerNote.findFirst({
            where: { id: noteId, customerId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        await this.prisma.customerNote.delete({ where: { id: noteId } });
        await this.auditLogsService.log({
            actorUserId,
            action: 'customer.note.deleted',
            entityType: 'CustomerNote',
            entityId: noteId,
            metadata: { customerId },
        });
        return { deleted: true };
    }
    async pinCustomerNote(customerId, noteId, actorUserId) {
        const note = await this.prisma.customerNote.findFirst({
            where: { id: noteId, customerId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        return this.prisma.customerNote.update({
            where: { id: noteId },
            data: { isPinned: true },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
    }
    async unpinCustomerNote(customerId, noteId, actorUserId) {
        const note = await this.prisma.customerNote.findFirst({
            where: { id: noteId, customerId },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        return this.prisma.customerNote.update({
            where: { id: noteId },
            data: { isPinned: false },
            include: { author: { select: NOTE_AUTHOR_SELECT } },
        });
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], NotesService);
//# sourceMappingURL=notes.service.js.map