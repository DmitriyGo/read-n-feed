import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthConfigService } from './auth-config.service';
import { AuthCookieOptionsService } from './auth-cookie-options.service';

@Module({
  imports: [ConfigModule],
  providers: [AuthConfigService, AuthCookieOptionsService],
  exports: [AuthConfigService, AuthCookieOptionsService],
})
export class AuthConfigModule {}
