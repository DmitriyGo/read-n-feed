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

  async upsert(token: Token): Promise<Token> {
    const props = (token as any).props;
    const upserted = await this.prisma.token.upsert({
      where: { token: props.token },
      update: {
        exp: props.exp,
        // etc
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
