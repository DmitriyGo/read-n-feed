import { Module } from '@nestjs/common';
import { BookFileRequestUseCase } from '@read-n-feed/application';
import {
  PrismaBookFileRepository,
  PrismaBookRequestRepository,
} from '@read-n-feed/data-access';

import { BookFileRequestController } from './book-file-request.controller';

@Module({
  controllers: [BookFileRequestController],
  providers: [
    // Application Use Cases
    BookFileRequestUseCase,

    // Domain Repositories
    {
      provide: 'IBookFileRepository',
      useClass: PrismaBookFileRepository,
    },
    {
      provide: 'IBookRequestRepository',
      useClass: PrismaBookRequestRepository,
    },
  ],
  exports: [BookFileRequestUseCase],
})
export class BookFileRequestModule {}
