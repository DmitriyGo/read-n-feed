import { Module } from '@nestjs/common';
import { BookUseCase } from '@read-n-feed/application';
import {
  PrismaBookRepository,
  PrismaAuthorRepository,
  PrismaGenreRepository,
  PrismaTagRepository,
} from '@read-n-feed/data-access';

import { BookController } from './book.controller';

@Module({
  controllers: [BookController],
  providers: [
    // Application Use Cases
    BookUseCase,

    // Domain Repositories
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
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
})
export class BookModule {}
