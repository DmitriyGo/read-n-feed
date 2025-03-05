import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LocalFileStorageService } from './local-file-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IFileStorageService',
      useClass: LocalFileStorageService,
    },
  ],
  exports: ['IFileStorageService'],
})
export class FileStorageModule {}
