import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class AuthConfigService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly expiresIn: string;

  constructor(private readonly configService: ConfigService) {
    // By default, read from Docker secrets path:
    const privateKeyPath =
      this.configService.get<string>('JWT_PRIVATE_KEY_PATH') ||
      '/run/secrets/jwt_private_key';
    const publicKeyPath =
      this.configService.get<string>('JWT_PUBLIC_KEY_PATH') ||
      '/run/secrets/jwt_public_key';

    this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    this.expiresIn = this.configService.get<string>('JWT_EXP', '15m');
  }

  getPrivateKey(): string {
    return this.privateKey;
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  getExpiresIn(): string {
    return this.expiresIn;
  }
}
