import {
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  IUserRepository,
  ISessionRepository,
  JwtPayload,
  UserRole,
} from '@read-n-feed/domain';
import { AuthConfigService } from '@read-n-feed/infrastructure';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepo: ISessionRepository,

    authConfigService: AuthConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfigService.getPublicKey(),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    try {
      this.logger.debug(`Validating JWT for user ID: ${payload.id}`);

      const user = await this.userRepo.findById(payload.id);
      if (!user) {
        this.logger.warn(`User not found: ${payload.id}`);
        throw new UnauthorizedException('User not found.');
      }

      const session = await this.sessionRepo.findById(payload.sessionId);
      if (!session) {
        this.logger.warn(`Session not found: ${payload.sessionId}`);
        throw new UnauthorizedException('Session not found.');
      }

      if (!session.isActive()) {
        this.logger.warn(`Session expired or revoked: ${payload.sessionId}`);
        throw new UnauthorizedException(
          'Session is expired or has been revoked.',
        );
      }

      const userProps = user.toPrimitives();

      if (userProps.isBlocked) {
        this.logger.warn(`Blocked user attempted access: ${payload.id}`);
        throw new UnauthorizedException('Your account has been blocked.');
      }

      const payloadWithRoles: JwtPayload = {
        id: payload.id,
        email: payload.email,
        roles: userProps.roles as UserRole[],
        sessionId: payload.sessionId,
      };

      this.logger.debug(
        `JWT validated for user ${payload.id} with roles: ${userProps.roles.join(', ')}`,
      );

      return payloadWithRoles;
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      throw error;
    }
  }
}
