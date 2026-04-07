import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('audit-logs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Permissions('audit_logs.read')
  @ApiOperation({ summary: 'Get paginated audit logs' })
  async findAll(@Query() query: PaginationDto) {
    const data = await this.auditLogsService.findAll(query.page, query.limit);
    return { message: 'Audit logs fetched successfully', data };
  }

  @Get(':entityType/:entityId')
  @Permissions('audit_logs.read')
  @ApiOperation({ summary: 'Get audit logs for specific entity' })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const data = await this.auditLogsService.findByEntity(entityType, entityId);
    return { message: 'Audit logs fetched successfully', data };
  }
}
