import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AuthConfigModule } from './auth-config.module';
import { AuthConfigService } from './auth-config.service';

@Module({
  imports: [
    AuthConfigModule,
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      inject: [AuthConfigService],
      useFactory: (authConfig: AuthConfigService): JwtModuleOptions => {
        return {
          privateKey: authConfig.getPrivateKey(),
          publicKey: authConfig.getPublicKey(),
          signOptions: {
            algorithm: 'RS256',
            expiresIn: authConfig.getExpiresIn(),
          },
        };
      },
    }),
  ],
  exports: [JwtModule, AuthConfigModule],
})
export class JwtRsaModule {}
