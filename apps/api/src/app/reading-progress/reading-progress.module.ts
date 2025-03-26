import { Module } from '@nestjs/common';
import { ReadingProgressUseCase } from '@read-n-feed/application';
import {
  PrismaReadingProgressRepository,
  PrismaBookRepository,
} from '@read-n-feed/data-access';

import { ReadingProgressController } from './reading-progress.controller';

@Module({
  controllers: [ReadingProgressController],
  providers: [
    // Application Use Cases
    ReadingProgressUseCase,

    // Domain Repositories
    {
      provide: 'IReadingProgressRepository',
      useClass: PrismaReadingProgressRepository,
    },
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
    },
  ],
  exports: [ReadingProgressUseCase],
})
export class ReadingProgressModule {}
