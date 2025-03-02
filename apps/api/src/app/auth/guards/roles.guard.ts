import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '@read-n-feed/domain';

import { IS_PUBLIC_KEY } from './public.decorator';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);
    this.logger.debug(
      `User data: ${user ? JSON.stringify(user) : 'No user data'}`,
    );

    if (!user) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    const jwtUser = user as JwtPayload;

    if (!jwtUser.roles || !Array.isArray(jwtUser.roles)) {
      this.logger.warn(
        `User ${jwtUser.id} has no roles property or it's not an array`,
      );
      throw new ForbiddenException('Invalid user role data');
    }

    const hasPermission = requiredRoles.some((role) =>
      jwtUser.roles.includes(role),
    );

    if (!hasPermission) {
      this.logger.warn(
        `User ${jwtUser.id} with roles [${jwtUser.roles.join(', ')}] tried to access a resource requiring [${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException(
        'You do not have the required role to access this resource',
      );
    }

    return true;
  }
}
