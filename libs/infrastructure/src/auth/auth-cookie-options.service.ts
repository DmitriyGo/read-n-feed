import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

@Injectable()
export class AuthCookieOptionsService {
  private readonly cookieOptions: CookieOptions;
  private readonly isDev: boolean;
  private readonly cookieMaxAge: number;

  constructor(private readonly configService: ConfigService) {
    this.isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    const days = this.configService.get<number>(
      'REFRESH_TOKEN_MAX_AGE_DAYS',
      30,
    );
    this.cookieMaxAge = days * 24 * 60 * 60 * 1000;

    let cookieDomain: string | undefined;
    let sameSite: 'strict' | 'lax' | 'none';

    if (this.isDev) {
      cookieDomain = 'localhost';
      sameSite = 'lax';
    } else {
      cookieDomain = undefined;
      sameSite = 'none';
    }

    this.cookieOptions = {
      httpOnly: true,
      secure: !this.isDev,
      sameSite,
      maxAge: this.cookieMaxAge,
      path: '/',
      domain: cookieDomain,
    };
  }

  getDefaultCookieOptions(): CookieOptions {
    return this.cookieOptions;
  }

  get isDevelopment(): boolean {
    return this.isDev;
  }

  get maxAgeInMs(): number {
    return this.cookieMaxAge;
  }
}
