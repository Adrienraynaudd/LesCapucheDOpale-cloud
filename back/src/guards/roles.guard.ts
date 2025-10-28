import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<number[]>('roles', context.getHandler()) || [];

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { roleId: number } }>();
    const user = request.user;

    console.log('[RolesGuard] Required roles:', requiredRoles);
    console.log('[RolesGuard] User from request:', user);

    if (!user?.roleId) {
      throw new ForbiddenException('No role found for user');
    }

    if (requiredRoles.length === 0) {
      throw new ForbiddenException('No roles defined for this route');
    }

    if (!requiredRoles.includes(user.roleId)) {
      throw new ForbiddenException(`User roleId ${user.roleId} not allowed`);
    }

    return true;
  }
}
