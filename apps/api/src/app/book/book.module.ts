import { Module } from '@nestjs/common';
import { BookUseCase } from '@read-n-feed/application';
import { PrismaBookRepository } from '@read-n-feed/data-access';

import { BookController } from './book.controller';

@Module({
  imports: [],
  controllers: [BookController],
  providers: [
    // Application Use Cases
    BookUseCase,

    // Domain Repositories
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
    },
  ],
})
export class BookModule {}
