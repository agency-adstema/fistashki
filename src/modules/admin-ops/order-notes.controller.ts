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

@ApiTags('Order Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrderNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('order_notes.create')
  @ApiOperation({ summary: 'Add internal note to order' })
  async create(@Param('id') id: string, @Body() dto: CreateNoteDto, @Request() req: any) {
    const data = await this.notesService.createOrderNote(id, dto, req.user?.id);
    return { data };
  }

  @Get(':id/notes')
  @Permissions('order_notes.read')
  @ApiOperation({ summary: 'List all notes for order' })
  async findAll(@Param('id') id: string) {
    const data = await this.notesService.listOrderNotes(id);
    return { data };
  }

  @Patch(':id/notes/:noteId')
  @Permissions('order_notes.update')
  @ApiOperation({ summary: 'Update an order note' })
  async update(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateNoteDto,
    @Request() req: any,
  ) {
    const data = await this.notesService.updateOrderNote(id, noteId, dto, req.user?.id);
    return { data };
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  @Permissions('order_notes.delete')
  @ApiOperation({ summary: 'Delete an order note' })
  async remove(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Request() req: any,
  ) {
    const data = await this.notesService.deleteOrderNote(id, noteId, req.user?.id);
    return { data };
  }

  @Post(':id/notes/:noteId/pin')
  @HttpCode(HttpStatus.OK)
  @Permissions('order_notes.update')
  @ApiOperation({ summary: 'Pin an order note' })
  async pin(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Request() req: any,
  ) {
    const data = await this.notesService.pinOrderNote(id, noteId, req.user?.id);
    return { data };
  }

  @Post(':id/notes/:noteId/unpin')
  @HttpCode(HttpStatus.OK)
  @Permissions('order_notes.update')
  @ApiOperation({ summary: 'Unpin an order note' })
  async unpin(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Request() req: any,
  ) {
    const data = await this.notesService.unpinOrderNote(id, noteId, req.user?.id);
    return { data };
  }
}
