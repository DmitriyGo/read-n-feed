import { Module } from '@nestjs/common';
import { BookRequestUseCase } from '@read-n-feed/application';
import {
  PrismaAuthorRepository,
  PrismaBookRepository,
  PrismaBookFileRepository,
  PrismaBookRequestRepository,
  PrismaGenreRepository,
  PrismaTagRepository,
  PrismaUserRepository,
} from '@read-n-feed/data-access';

import { BookRequestController } from './book-request.controller';
import { BookFileModule } from '../book-file/book-file.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [BookFileModule, FileUploadModule],
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
    {
      provide: 'IBookFileRepository',
      useClass: PrismaBookFileRepository,
    },
  ],
  exports: [BookRequestUseCase],
})
export class BookRequestModule {}
