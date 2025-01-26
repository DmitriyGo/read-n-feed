import { Module } from '@nestjs/common';
import { UserUseCase } from '@read-n-feed/application';
import { PrismaUserRepository } from '@read-n-feed/data-access';

import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    UserUseCase,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [],
})
export class UserModule {}
