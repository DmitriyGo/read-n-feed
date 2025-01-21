import { Injectable } from '@nestjs/common';
import { ITokenRepository, Token } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string): Promise<Token | null> {
    const tokenModel = await this.prisma.token.findUnique({ where: { token } });
    if (!tokenModel) return null;
    return new Token({ ...tokenModel });
  }

  async findByUserIdAndUserAgent(
    userId: string,
    userAgent: string,
  ): Promise<Token | null> {
    const tokenModel = await this.prisma.token.findUnique({
      where: {
        userId_userAgent: { userId, userAgent },
      },
    });
    if (!tokenModel) return null;
    return new Token({ ...tokenModel });
  }

  async upsert(token: Token): Promise<Token> {
    const props = (token as any).props;

    const upserted = await this.prisma.token.upsert({
      where: {
        userId_userAgent: {
          userId: props.userId,
          userAgent: props.userAgent || '',
        },
      },
      update: {
        token: props.token,
        exp: props.exp,
        updatedAt: props.updatedAt,
      },
      create: {
        ...props,
      },
    });
    return new Token({ ...upserted });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.token.delete({ where: { token } }).catch(() => {
      // handle error if needed
    });
  }
}
