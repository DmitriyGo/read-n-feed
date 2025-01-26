import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IUserRepository } from '@read-n-feed/domain';
import { AuthConfigService } from '@read-n-feed/infrastructure';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authConfigService: AuthConfigService,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfigService.getPublicKey(),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: { id: string; email: string; roles: string[] }) {
    const user = await this.userRepo.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user['props'].isBlocked) {
      throw new UnauthorizedException('User is blocked');
    }
    return payload;
  }
}
