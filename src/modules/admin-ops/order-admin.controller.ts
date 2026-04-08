import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { AdminOpsService } from './admin-ops.service';
import { AssignOrderDto } from './dto/assign-order.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { TimelineQueryDto } from './dto/timeline-query.dto';

@ApiTags('Order Admin Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrderAdminController {
  constructor(
    private readonly adminOpsService: AdminOpsService,
    private readonly tagsService: TagsService,
  ) {}

  @Get(':id/tags')
  @Permissions('order_tags.read')
  @ApiOperation({ summary: 'Get all tags assigned to an order' })
  async getOrderTags(@Param('id') id: string) {
    const data = await this.tagsService.getOrderTags(id);
    return { data };
  }

  @Post(':id/tags/:tagId')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('order_tags.create')
  @ApiOperation({ summary: 'Assign a tag to an order' })
  async assignTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @Request() req: any,
  ) {
    const data = await this.tagsService.assignTag(id, tagId, req.user?.id);
    return { data };
  }

  @Delete(':id/tags/:tagId')
  @HttpCode(HttpStatus.OK)
  @Permissions('order_tags.delete')
  @ApiOperation({ summary: 'Remove a tag from an order' })
  async removeTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @Request() req: any,
  ) {
    const data = await this.tagsService.removeTag(id, tagId, req.user?.id);
    return { data };
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @Permissions('orders.assign')
  @ApiOperation({ summary: 'Assign an order to an admin user' })
  async assign(@Param('id') id: string, @Body() dto: AssignOrderDto, @Request() req: any) {
    const data = await this.adminOpsService.assignOrder(id, dto, req.user?.id);
    return { data };
  }

  @Post(':id/unassign')
  @HttpCode(HttpStatus.OK)
  @Permissions('orders.assign')
  @ApiOperation({ summary: 'Remove assignee from an order' })
  async unassign(@Param('id') id: string, @Request() req: any) {
    const data = await this.adminOpsService.unassignOrder(id, req.user?.id);
    return { data };
  }

  @Patch(':id/priority')
  @Permissions('orders.set_priority')
  @ApiOperation({ summary: 'Set order priority' })
  async setPriority(
    @Param('id') id: string,
    @Body() dto: SetPriorityDto,
    @Request() req: any,
  ) {
    const data = await this.adminOpsService.setPriority(id, dto, req.user?.id);
    return { data };
  }

  @Get(':id/timeline')
  @Permissions('orders.timeline.read')
  @ApiOperation({ summary: 'Get unified timeline for an order' })
  async getTimeline(@Param('id') id: string, @Query() query: TimelineQueryDto) {
    const data = await this.adminOpsService.getTimeline(id, query);
    return { data };
  }
}
