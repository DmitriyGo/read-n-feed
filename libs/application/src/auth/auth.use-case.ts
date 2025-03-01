import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository, JwtPayload, User } from '@read-n-feed/domain';
import { ISessionRepository, Session } from '@read-n-feed/domain';
import { ITokenGenerator } from '@read-n-feed/domain';
import { lookupLocation, parseUserAgent } from '@read-n-feed/shared';
import { compareSync, hashSync } from 'bcrypt';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject('ITokenGenerator') private readonly tokenGen: ITokenGenerator,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepo: ISessionRepository,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    await this.ensureEmailIsUnique(dto.email);

    const hashedPassword = hashSync(dto.password, 12);
    const user = new User({
      id: uuidv4(),
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      avatarUrl: dto.avatarUrl ?? null,

      provider: 'LOCAL',
      roles: ['USER'],
      isBlocked: false,
      subscriptionPlan: 'FREE',

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepo.save(user);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.validateUserCredentials(dto.email, dto.password);

    const refreshToken = await this.createSession(user, userAgent, ipAddress);
    const sessionId = refreshToken.split('.')[0];

    const accessToken = this.createAccessToken(user, sessionId);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    const { sessionId, rawSecret } = this.parseRefreshToken(refreshToken);
    const session = await this.validateSession(sessionId, rawSecret);

    const newRefreshToken = await this.rotateSessionToken(session);
    const accessToken = await this.createAccessTokenFromSession(session);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string, logoutAll = false) {
    const { sessionId } = this.parseRefreshToken(refreshToken);

    if (logoutAll) {
      const session = await this.sessionRepo.findById(sessionId);
      if (!session) return;
      await this.sessionRepo.deleteAllByUser(session.userId);
      return;
    }

    await this.sessionRepo.delete(sessionId);
  }

  private async ensureEmailIsUnique(email: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException(
        `User with email "${email}" already exists.`,
      );
    }
  }

  private async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user['props'].password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user['props'].isBlocked) {
      throw new UnauthorizedException('User is blocked.');
    }

    if (!compareSync(password, user['props'].password)) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return user;
  }

  private createAccessToken(user: User, sessionId: string): string {
    const jwtExp = this.config.getOrThrow<string>('JWT_EXP');
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      roles: user['props'].roles,
      sessionId,
    };
    return 'Bearer ' + this.tokenGen.generateAccessToken(payload, jwtExp);
  }

  private async createSession(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const ua = userAgent || 'unknown';
    const ip = ipAddress || 'unknown';

    const existingSessions = await this.sessionRepo.findActiveByUserAndDevice(
      user.id,
      ua,
      ip,
    );
    await Promise.all(
      existingSessions.map((s) => this.sessionRepo.delete(s.id)),
    );

    const refreshDays = parseInt(
      this.config.getOrThrow<string>('REFRESH_TOKEN_MAX_AGE_DAYS'),
    );
    const sessionExpiration = add(new Date(), { days: refreshDays });

    const rawRefreshSecret = uuidv4();
    const refreshTokenHash = hashSync(rawRefreshSecret, 10);

    const location = ip !== 'unknown' ? lookupLocation(ip) : null;
    const device = ua !== 'unknown' ? parseUserAgent(ua) : null;

    const session = new Session({
      id: uuidv4(),
      userId: user.id,
      refreshTokenHash,
      userAgent: ua,
      ipAddress: ip,
      locationMetadata: location,
      deviceType: device,
      expiresAt: sessionExpiration,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.sessionRepo.create(session);

    return `${session.id}.${rawRefreshSecret}`;
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepo.findActiveByUser(userId);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }
    await this.sessionRepo.delete(sessionId);
  }

  private parseRefreshToken(refreshToken: string) {
    const parts = refreshToken.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid refresh token format.');
    }
    return { sessionId: parts[0], rawSecret: parts[1] };
  }

  private async validateSession(
    sessionId: string,
    rawSecret: string,
  ): Promise<Session> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || !session.isActive()) {
      throw new UnauthorizedException('Refresh token is expired or not found.');
    }

    if (!compareSync(rawSecret, session.refreshTokenHash)) {
      session.revoke();
      await this.sessionRepo.update(session);
      throw new ForbiddenException('Refresh token reuse detected.');
    }

    return session;
  }

  private async rotateSessionToken(session: Session): Promise<string> {
    const newRawSecret = uuidv4();
    const newHash = hashSync(newRawSecret, 10);
    const refreshDays = parseInt(
      this.config.getOrThrow<string>('REFRESH_TOKEN_MAX_AGE_DAYS'),
    );
    const newExpiration = add(new Date(), { days: refreshDays });

    session.rotateToken(newHash, newExpiration);
    await this.sessionRepo.update(session);

    return `${session.id}.${newRawSecret}`;
  }

  private async createAccessTokenFromSession(
    session: Session,
  ): Promise<string> {
    const user = await this.userRepo.findById(session.userId);
    if (!user) {
      session.revoke();
      await this.sessionRepo.update(session);
      throw new NotFoundException('User not found.');
    }
    if (user['props'].isBlocked) {
      session.revoke();
      await this.sessionRepo.update(session);
      throw new UnauthorizedException('User is blocked.');
    }
    return this.createAccessToken(user, session.id);
  }
}
