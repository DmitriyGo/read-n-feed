import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BookImageRequestUseCase } from '@read-n-feed/application';
import {
  PrismaBookImageRequestRepository,
  PrismaBookRepository,
} from '@read-n-feed/data-access';
import { FileStorageModule } from '@read-n-feed/infrastructure';

import { BookImageRequestAdminController } from './book-image-request-admin.controller';
import { BookImageRequestUserController } from './book-image-request-user.controller';

@Module({
  imports: [
    FileStorageModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for images
      },
    }),
  ],
  controllers: [
    BookImageRequestAdminController,
    BookImageRequestUserController,
  ],
  providers: [
    // Application Use Cases
    BookImageRequestUseCase,

    // Domain Repositories
    {
      provide: 'IBookImageRequestRepository',
      useClass: PrismaBookImageRequestRepository,
    },
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
    },
  ],
  exports: [BookImageRequestUseCase],
})
export class BookImageRequestModule {}
