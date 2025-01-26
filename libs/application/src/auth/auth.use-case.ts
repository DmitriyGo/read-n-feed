import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ITokenGenerator,
  ITokenRepository,
  IUserRepository,
  Token,
  User,
} from '@read-n-feed/domain';
import { compareSync, hashSync } from 'bcrypt';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { LoginDto, RegisterDto } from './auth.dto';
import { TokenExpiredError } from '../exceptions/token-expired.error';
import { UserAlreadyExistsError } from '../exceptions/user-already-exists.error';

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ITokenRepository') private readonly tokenRepo: ITokenRepository,
    @Inject('ITokenGenerator') private readonly tokenGen: ITokenGenerator,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new UserAlreadyExistsError(dto.email);

    const hashedPass = hashSync(dto.password, 12);
    const user = new User({
      id: uuidv4(),
      email: dto.email,
      password: hashedPass,
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

  async login(
    dto: LoginDto,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user['props'].password) {
      throw new UnauthorizedException('User not found or no password set.');
    }

    if (user['props'].isBlocked) {
      throw new UnauthorizedException('User is blocked.');
    }

    const passwordMatches = compareSync(dto.password, user['props'].password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Wrong password.');
    }

    const accessToken =
      'Bearer ' +
      this.tokenGen.generateAccessToken({
        id: user.id,
        email: user.email,
        roles: user['props'].roles,
      });

    const refreshToken = await this.generateRefreshToken(user.id, userAgent);

    return { accessToken, refreshToken: refreshToken.token };
  }

  async refreshTokens(
    oldRefreshToken: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenEntity = await this.tokenRepo.findByToken(oldRefreshToken);

    if (!tokenEntity || tokenEntity.isExpired()) {
      if (tokenEntity) {
        await this.tokenRepo.deleteByToken(tokenEntity.token);
      }
      throw new TokenExpiredError();
    }

    // remove the old token to rotate
    await this.tokenRepo.deleteByToken(oldRefreshToken);

    const user = await this.userRepo.findById(tokenEntity.userId);
    if (!user) {
      throw new NotFoundException('User for this token not found.');
    }

    if (user['props'].isBlocked) {
      throw new UnauthorizedException('User is blocked.');
    }

    const newAccessToken =
      'Bearer ' +
      this.tokenGen.generateAccessToken({
        id: user.id,
        email: user.email,
        roles: user['props'].roles,
      });

    const newRefreshToken = await this.generateRefreshToken(user.id, userAgent);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken.token };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenRepo.deleteByToken(refreshToken);
  }

  private async generateRefreshToken(
    userId: string,
    userAgent = 'unknown',
  ): Promise<Token> {
    const exp = add(new Date(), { days: 30 });

    const token = new Token({
      id: uuidv4(),
      token: uuidv4(), // actual token string
      userId,
      userAgent,
      exp,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.tokenRepo.upsert(token);
  }
}
