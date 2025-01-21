import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenGenerator } from '@read-n-feed/domain';

@Injectable()
export class JwtTokenGeneratorAdapter implements ITokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: any, expiresIn?: string): string {
    return this.jwtService.sign(payload, expiresIn ? { expiresIn } : {});
  }

  verifyAccessToken(token: string): any {
    return this.jwtService.verify(token);
  }
}
