import { Module } from '@nestjs/common';
import { AuthUseCase } from '@read-n-feed/application';
import {
  PrismaTokenRepository,
  PrismaUserRepository,
} from '@read-n-feed/data-access';
import {
  JwtRsaModule,
  JwtTokenGeneratorAdapter,
} from '@read-n-feed/infrastructure';

import { AuthController } from './auth.controller';

@Module({
  imports: [JwtRsaModule],
  controllers: [AuthController],
  providers: [
    // Application Use Cases
    AuthUseCase,

    // Domain Repositories
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'ITokenRepository',
      useClass: PrismaTokenRepository,
    },

    // Token Generator
    {
      provide: 'ITokenGenerator',
      useClass: JwtTokenGeneratorAdapter,
    },
  ],
})
export class AuthModule {}
