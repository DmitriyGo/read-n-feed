import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.warn(
        `Authentication failed: ${err?.message || 'No user found'} - Token info: ${
          info?.message || 'N/A'
        }`,
      );

      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Your session has expired. Please log in again.',
        );
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid authentication token.');
      }

      throw new UnauthorizedException(
        err?.message || 'You are not authorized to access this resource',
      );
    }

    return user;
  }
}
