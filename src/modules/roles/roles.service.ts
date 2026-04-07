import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { key: dto.key },
    });
    if (existing) throw new ConflictException('Role key already exists');
    return this.prisma.role.create({ data: dto });
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    await this.findOne(roleId);

    if (permissionIds.length > 0) {
      const found = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
        select: { id: true },
      });

      if (found.length !== permissionIds.length) {
        const foundIds = found.map((p) => p.id);
        const invalid = permissionIds.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `Invalid permission IDs: ${invalid.join(', ')}`,
        );
      }
    }

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }

    return this.findOne(roleId);
  }
}
