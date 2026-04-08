import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

const NOTE_AUTHOR_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
};

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // ───────────────── ORDER NOTES ─────────────────

  async createOrderNote(orderId: string, dto: CreateNoteDto, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

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

  async listOrderNotes(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.orderNote.findMany({
      where: { orderId },
      include: { author: { select: NOTE_AUTHOR_SELECT } },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateOrderNote(
    orderId: string,
    noteId: string,
    dto: UpdateNoteDto,
    actorUserId?: string,
  ) {
    const note = await this.prisma.orderNote.findFirst({
      where: { id: noteId, orderId },
    });
    if (!note) throw new NotFoundException('Note not found');

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

  async deleteOrderNote(orderId: string, noteId: string, actorUserId?: string) {
    const note = await this.prisma.orderNote.findFirst({
      where: { id: noteId, orderId },
    });
    if (!note) throw new NotFoundException('Note not found');

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

  async pinOrderNote(orderId: string, noteId: string, actorUserId?: string) {
    const note = await this.prisma.orderNote.findFirst({
      where: { id: noteId, orderId },
    });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.orderNote.update({
      where: { id: noteId },
      data: { isPinned: true },
      include: { author: { select: NOTE_AUTHOR_SELECT } },
    });
  }

  async unpinOrderNote(orderId: string, noteId: string, actorUserId?: string) {
    const note = await this.prisma.orderNote.findFirst({
      where: { id: noteId, orderId },
    });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.orderNote.update({
      where: { id: noteId },
      data: { isPinned: false },
      include: { author: { select: NOTE_AUTHOR_SELECT } },
    });
  }

  // ───────────────── CUSTOMER NOTES ─────────────────

  async createCustomerNote(customerId: string, dto: CreateNoteDto, actorUserId?: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

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

  async listCustomerNotes(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.customerNote.findMany({
      where: { customerId },
      include: { author: { select: NOTE_AUTHOR_SELECT } },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateCustomerNote(
    customerId: string,
    noteId: string,
    dto: UpdateNoteDto,
    actorUserId?: string,
  ) {
    const note = await this.prisma.customerNote.findFirst({
      where: { id: noteId, customerId },
    });
    if (!note) throw new NotFoundException('Note not found');

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

  async deleteCustomerNote(customerId: string, noteId: string, actorUserId?: string) {
    const note = await this.prisma.customerNote.findFirst({
      where: { id: noteId, customerId },
    });
    if (!note) throw new NotFoundException('Note not found');

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

  async pinCustomerNote(customerId: string, noteId: string, actorUserId?: string) {
    const note = await this.prisma.customerNote.findFirst({
      where: { id: noteId, customerId },
    });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.customerNote.update({
      where: { id: noteId },
      data: { isPinned: true },
      include: { author: { select: NOTE_AUTHOR_SELECT } },
    });
  }

  async unpinCustomerNote(customerId: string, noteId: string, actorUserId?: string) {
    const note = await this.prisma.customerNote.findFirst({
      where: { id: noteId, customerId },
    });
    if (!note) throw new NotFoundException('Note not found');

    return this.prisma.customerNote.update({
      where: { id: noteId },
      data: { isPinned: false },
      include: { author: { select: NOTE_AUTHOR_SELECT } },
    });
  }
}
