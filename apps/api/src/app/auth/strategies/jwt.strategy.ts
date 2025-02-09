import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IUserRepository } from '@read-n-feed/domain';
import { ISessionRepository } from '@read-n-feed/domain';
import { AuthConfigService } from '@read-n-feed/infrastructure';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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

  async validate(payload: { id: string; email: string; sessionId: string }) {
    const user = await this.userRepo.findById(payload.id);
    if (!user) throw new UnauthorizedException('User not found.');

    const session = await this.sessionRepo.findById(payload.sessionId);
    if (!session || !session.isActive()) {
      throw new UnauthorizedException('Session is invalid or expired.');
    }

    return payload;
  }
}
