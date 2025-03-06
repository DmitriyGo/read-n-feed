import { Module } from '@nestjs/common';
import { BookRequestUseCase } from '@read-n-feed/application';
import {
  PrismaAuthorRepository,
  PrismaBookRepository,
  PrismaBookRequestRepository,
  PrismaGenreRepository,
  PrismaTagRepository,
  PrismaUserRepository,
} from '@read-n-feed/data-access';

import { BookRequestController } from './book-request.controller';

@Module({
  controllers: [BookRequestController],
  providers: [
    // Application Use Cases
    BookRequestUseCase,

    // Domain Repositories
    {
      provide: 'IBookRequestRepository',
      useClass: PrismaBookRequestRepository,
    },
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IAuthorRepository',
      useClass: PrismaAuthorRepository,
    },
    {
      provide: 'IGenreRepository',
      useClass: PrismaGenreRepository,
    },
    {
      provide: 'ITagRepository',
      useClass: PrismaTagRepository,
    },
  ],
  exports: [BookRequestUseCase],
})
export class BookRequestModule {}
