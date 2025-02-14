import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthUseCase } from '@read-n-feed/application';
import {
  PrismaSessionRepository,
  PrismaUserRepository,
} from '@read-n-feed/data-access';
import {
  JwtRsaModule,
  JwtTokenGeneratorAdapter,
} from '@read-n-feed/infrastructure';

import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [JwtRsaModule, ConfigModule],
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
      provide: 'ISessionRepository',
      useClass: PrismaSessionRepository,
    },

    // Token Generator
    {
      provide: 'ITokenGenerator',
      useClass: JwtTokenGeneratorAdapter,
    },

    // Passport Strategy
    JwtStrategy,

    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
