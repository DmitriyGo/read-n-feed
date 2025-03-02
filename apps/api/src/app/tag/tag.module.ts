import { Module } from '@nestjs/common';
import { TagUseCase } from '@read-n-feed/application';
import { PrismaTagRepository } from '@read-n-feed/data-access';

import { TagController } from './tag.controller';

@Module({
  controllers: [TagController],
  providers: [
    // Application Use Cases
    TagUseCase,

    // Domain Repositories
    {
      provide: 'ITagRepository',
      useClass: PrismaTagRepository,
    },
  ],
  exports: [TagUseCase],
})
export class TagModule {}
