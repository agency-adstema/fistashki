import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@ApiTags('Customer Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomerNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('customer_notes.create')
  @ApiOperation({ summary: 'Add internal note to customer' })
  async create(@Param('id') id: string, @Body() dto: CreateNoteDto, @Request() req: any) {
    const data = await this.notesService.createCustomerNote(id, dto, req.user?.id);
    return { data };
  }

  @Get(':id/notes')
  @Permissions('customer_notes.read')
  @ApiOperation({ summary: 'List all notes for customer' })
  async findAll(@Param('id') id: string) {
    const data = await this.notesService.listCustomerNotes(id);
    return { data };
  }

  @Patch(':id/notes/:noteId')
  @Permissions('customer_notes.update')
  @ApiOperation({ summary: 'Update a customer note' })
  async update(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateNoteDto,
    @Request() req: any,
  ) {
    const data = await this.notesService.updateCustomerNote(id, noteId, dto, req.user?.id);
    return { data };
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  @Permissions('customer_notes.delete')
  @ApiOperation({ summary: 'Delete a customer note' })
  async remove(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Request() req: any,
  ) {
    const data = await this.notesService.deleteCustomerNote(id, noteId, req.user?.id);
    return { data };
  }

  @Post(':id/notes/:noteId/pin')
  @HttpCode(HttpStatus.OK)
  @Permissions('customer_notes.update')
  @ApiOperation({ summary: 'Pin a customer note' })
  async pin(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Request() req: any,
  ) {
    const data = await this.notesService.pinCustomerNote(id, noteId, req.user?.id);
    return { data };
  }

  @Post(':id/notes/:noteId/unpin')
  @HttpCode(HttpStatus.OK)
  @Permissions('customer_notes.update')
  @ApiOperation({ summary: 'Unpin a customer note' })
  async unpin(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Request() req: any,
  ) {
    const data = await this.notesService.unpinCustomerNote(id, noteId, req.user?.id);
    return { data };
  }
}
