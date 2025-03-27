import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BookFileRequestUseCase } from '@read-n-feed/application';
import {
  PrismaBookFileRequestRepository,
  PrismaBookRepository,
  PrismaBookFileRepository,
} from '@read-n-feed/data-access';
import { FileStorageModule } from '@read-n-feed/infrastructure';

import { BookFileRequestAdminController } from './book-file-request-admin.controller';
import { BookFileRequestUserController } from './book-file-request-user.controller';
import { BookFileModule } from '../book-file/book-file.module';

@Module({
  imports: [
    FileStorageModule,
    BookFileModule,
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  ],
  controllers: [BookFileRequestAdminController, BookFileRequestUserController],
  providers: [
    // Application Use Cases
    BookFileRequestUseCase,

    // Domain Repositories
    {
      provide: 'IBookFileRequestRepository',
      useClass: PrismaBookFileRequestRepository,
    },
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
    },
    {
      provide: 'IBookFileRepository',
      useClass: PrismaBookFileRepository,
    },
  ],
  exports: [BookFileRequestUseCase],
})
export class BookFileRequestModule {}
