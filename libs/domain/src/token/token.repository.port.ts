import { Token } from './token.entity';

export interface ITokenRepository {
  findByToken(token: string): Promise<Token | null>;
  findByUserIdAndUserAgent(
    userId: string,
    userAgent: string,
  ): Promise<Token | null>;
  upsert(token: Token): Promise<Token>;
  deleteByToken(token: string): Promise<void>;
}
