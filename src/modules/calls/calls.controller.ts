import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('calls')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  @Permissions('calls.read')
  @ApiOperation({ summary: 'Get all calls (paginated)' })
  async getAllCalls(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const data = await this.callsService.getAllCalls(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return { message: 'Calls fetched successfully', data };
  }

  @Get('stats')
  @Permissions('calls.read')
  @ApiOperation({ summary: 'Get call statistics' })
  async getStats() {
    const data = await this.callsService.getCallStats();
    return { message: 'Stats fetched successfully', data };
  }

  @Get(':id')
  @Permissions('calls.read')
  @ApiOperation({ summary: 'Get call by ID' })
  async getCall(@Param('id') id: string) {
    const data = await this.callsService.getCallLog(id);
    if (!data) {
      return { message: 'Call not found', data: null };
    }
    return { message: 'Call fetched successfully', data };
  }

  @Post(':id/retry')
  @Permissions('calls.manage')
  @ApiOperation({ summary: 'Retry a failed call' })
  async retryCall(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.callsService.retryCall(id, user?.id);
    return { message: 'Call retry scheduled', data };
  }
}
