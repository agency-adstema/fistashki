import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { RejectReturnDto } from './dto/reject-return.dto';
import { ReturnsQueryDto } from './dto/returns-query.dto';

@ApiTags('Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('returns.create')
  @ApiOperation({ summary: 'Create a return request' })
  async create(@Body() dto: CreateReturnDto, @Request() req: any) {
    const data = await this.returnsService.create(dto, req.user?.userId);
    return { data };
  }

  @Get()
  @Permissions('returns.read')
  @ApiOperation({ summary: 'List return requests' })
  async findAll(@Query() query: ReturnsQueryDto) {
    const data = await this.returnsService.findAll(query);
    return { data };
  }

  @Get(':id')
  @Permissions('returns.read')
  @ApiOperation({ summary: 'Get a return request by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.returnsService.findOne(id);
    return { data };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @Permissions('returns.approve')
  @ApiOperation({ summary: 'Approve a return request' })
  async approve(@Param('id') id: string, @Request() req: any) {
    const data = await this.returnsService.approve(id, req.user?.userId);
    return { data };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @Permissions('returns.reject')
  @ApiOperation({ summary: 'Reject a return request' })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectReturnDto,
    @Request() req: any,
  ) {
    const data = await this.returnsService.reject(id, dto, req.user?.userId);
    return { data };
  }

  @Post(':id/mark-received')
  @HttpCode(HttpStatus.OK)
  @Permissions('returns.receive')
  @ApiOperation({ summary: 'Mark return items as received (triggers stock reintegration)' })
  async markReceived(@Param('id') id: string, @Request() req: any) {
    const data = await this.returnsService.markReceived(id, req.user?.userId);
    return { data };
  }

  @Post(':id/mark-refund-pending')
  @HttpCode(HttpStatus.OK)
  @Permissions('returns.refund')
  @ApiOperation({ summary: 'Mark return as refund pending' })
  async markRefundPending(@Param('id') id: string, @Request() req: any) {
    const data = await this.returnsService.markRefundPending(id, req.user?.userId);
    return { data };
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @Permissions('returns.refund')
  @ApiOperation({ summary: 'Process refund for the return (based on return items total)' })
  async refund(@Param('id') id: string, @Request() req: any) {
    const data = await this.returnsService.refund(id, req.user?.userId);
    return { data };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @Permissions('returns.complete')
  @ApiOperation({ summary: 'Complete the return process' })
  async complete(@Param('id') id: string, @Request() req: any) {
    const data = await this.returnsService.complete(id, req.user?.userId);
    return { data };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions('returns.cancel')
  @ApiOperation({ summary: 'Cancel a return request' })
  async cancel(@Param('id') id: string, @Request() req: any) {
    const data = await this.returnsService.cancel(id, req.user?.userId);
    return { data };
  }
}
