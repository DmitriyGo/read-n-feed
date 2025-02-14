import { JwtPayload } from './jwt-payload.type';

export interface ITokenGenerator {
  generateAccessToken(payload: JwtPayload, expiresIn?: string): string;
  verifyAccessToken(token: string): JwtPayload;
}
