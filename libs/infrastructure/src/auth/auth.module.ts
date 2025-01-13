import { Module } from '@nestjs/common';
import { RegisterUserUseCase } from '@read-n-feed/application';
import { DataAccessModule, PrismaUserRepository } from '@read-n-feed/data-access';

import { AuthController } from './auth.controller';

@Module({
  imports: [DataAccessModule],
  controllers: [AuthController],
  providers: [
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo: PrismaUserRepository) => {
        return new RegisterUserUseCase(userRepo);
      },
      inject: [PrismaUserRepository],
    },
  ],
})
export class AuthModule {}
