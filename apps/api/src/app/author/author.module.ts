import { Module } from '@nestjs/common';
import { AuthorUseCase } from '@read-n-feed/application';
import { PrismaAuthorRepository } from '@read-n-feed/data-access';

import { AuthorController } from './author.controller';

@Module({
  controllers: [AuthorController],
  providers: [
    // Application Use Cases
    AuthorUseCase,

    // Domain Repositories
    {
      provide: 'IAuthorRepository',
      useClass: PrismaAuthorRepository,
    },
  ],
  exports: [AuthorUseCase],
})
export class AuthorModule {}
