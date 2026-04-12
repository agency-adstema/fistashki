import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
    createOrderNote(orderId: string, dto: CreateNoteDto, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        orderId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
    listOrderNotes(orderId: string): Promise<({
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        orderId: string;
        isPinned: boolean;
        authorUserId: string | null;
    })[]>;
    updateOrderNote(orderId: string, noteId: string, dto: UpdateNoteDto, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        orderId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
    deleteOrderNote(orderId: string, noteId: string, actorUserId?: string): Promise<{
        deleted: boolean;
    }>;
    pinOrderNote(orderId: string, noteId: string, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        orderId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
    unpinOrderNote(orderId: string, noteId: string, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        orderId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
    createCustomerNote(customerId: string, dto: CreateNoteDto, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        customerId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
    listCustomerNotes(customerId: string): Promise<({
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        customerId: string;
        isPinned: boolean;
        authorUserId: string | null;
    })[]>;
    updateCustomerNote(customerId: string, noteId: string, dto: UpdateNoteDto, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        customerId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
    deleteCustomerNote(customerId: string, noteId: string, actorUserId?: string): Promise<{
        deleted: boolean;
    }>;
    pinCustomerNote(customerId: string, noteId: string, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        customerId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
    unpinCustomerNote(customerId: string, noteId: string, actorUserId?: string): Promise<{
        author: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        customerId: string;
        isPinned: boolean;
        authorUserId: string | null;
    }>;
}
