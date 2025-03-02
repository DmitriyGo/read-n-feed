import { Module } from '@nestjs/common';
import { GenreUseCase } from '@read-n-feed/application';
import { PrismaGenreRepository } from '@read-n-feed/data-access';

import { GenreController } from './genre.controller';

@Module({
  controllers: [GenreController],
  providers: [
    // Application Use Cases
    GenreUseCase,

    // Domain Repositories
    {
      provide: 'IGenreRepository',
      useClass: PrismaGenreRepository,
    },
  ],
  exports: [GenreUseCase],
})
export class GenreModule {}
