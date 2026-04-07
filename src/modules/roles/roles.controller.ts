import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    const data = await this.rolesService.findAll();
    return { message: 'Roles fetched successfully', data };
  }

  @Get(':id')
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.rolesService.findOne(id);
    return { message: 'Role fetched successfully', data };
  }

  @Post()
  @Permissions('roles.create')
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() dto: CreateRoleDto) {
    const data = await this.rolesService.create(dto);
    return { message: 'Role created successfully', data };
  }

  @Put(':id/permissions')
  @Permissions('permissions.assign')
  @ApiOperation({ summary: 'Replace all permissions on a role' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    const data = await this.rolesService.assignPermissions(id, dto.permissionIds);
    return { message: 'Permissions assigned successfully', data };
  }
}
