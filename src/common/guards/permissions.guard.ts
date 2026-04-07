import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Access denied');

    const userPermissions = new Set<string>();
    user.userRoles?.forEach((ur: any) => {
      ur.role?.rolePermissions?.forEach((rp: any) => {
        userPermissions.add(rp.permission.key);
      });
    });

    if (!requiredPermissions.every((p) => userPermissions.has(p))) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
