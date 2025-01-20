export interface ITokenGenerator {
  generateAccessToken(payload: any, expiresIn?: string): string;
  verifyAccessToken(token: string): any;
}
