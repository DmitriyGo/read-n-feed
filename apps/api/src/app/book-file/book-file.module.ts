import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BookFileUseCase } from '@read-n-feed/application';
import {
  PrismaBookFileRepository,
  PrismaBookRepository,
  PrismaBookRequestRepository,
} from '@read-n-feed/data-access';
import { FileStorageModule } from '@read-n-feed/infrastructure';

import { BookFileController } from './book-file.controller';

@Module({
  imports: [
    FileStorageModule,
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  ],
  controllers: [BookFileController],
  providers: [
    // Application Use Cases
    BookFileUseCase,

    // Domain Repositories
    {
      provide: 'IBookFileRepository',
      useClass: PrismaBookFileRepository,
    },
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
    },
    {
      provide: 'IBookRequestRepository',
      useClass: PrismaBookRequestRepository,
    },
  ],
  exports: [BookFileUseCase],
})
export class BookFileModule {}
