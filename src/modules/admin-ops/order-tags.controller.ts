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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@ApiTags('Order Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('order-tags')
export class OrderTagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('order_tags.create')
  @ApiOperation({ summary: 'Create a reusable order tag' })
  async create(@Body() dto: CreateTagDto, @Request() req: any) {
    const data = await this.tagsService.createTag(dto, req.user?.id);
    return { data };
  }

  @Get()
  @Permissions('order_tags.read')
  @ApiOperation({ summary: 'List all order tags' })
  async findAll() {
    const data = await this.tagsService.findAllTags();
    return { data };
  }

  @Patch(':id')
  @Permissions('order_tags.update')
  @ApiOperation({ summary: 'Update an order tag' })
  async update(@Param('id') id: string, @Body() dto: UpdateTagDto, @Request() req: any) {
    const data = await this.tagsService.updateTag(id, dto, req.user?.id);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('order_tags.delete')
  @ApiOperation({ summary: 'Delete an order tag (removes all assignments)' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const data = await this.tagsService.deleteTag(id, req.user?.id);
    return { data };
  }
}
