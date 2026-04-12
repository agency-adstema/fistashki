import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class CustomerNotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    create(id: string, dto: CreateNoteDto, req: any): Promise<{
        data: {
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
        };
    }>;
    findAll(id: string): Promise<{
        data: ({
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
        })[];
    }>;
    update(id: string, noteId: string, dto: UpdateNoteDto, req: any): Promise<{
        data: {
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
        };
    }>;
    remove(id: string, noteId: string, req: any): Promise<{
        data: {
            deleted: boolean;
        };
    }>;
    pin(id: string, noteId: string, req: any): Promise<{
        data: {
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
        };
    }>;
    unpin(id: string, noteId: string, req: any): Promise<{
        data: {
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
        };
    }>;
}
