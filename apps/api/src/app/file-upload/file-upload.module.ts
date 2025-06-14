import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileStorageModule } from '@read-n-feed/infrastructure';

import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [
    FileStorageModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for images
      },
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
