import { Module } from '@nestjs/common';
import { RecommendationUseCase } from '@read-n-feed/application';
import {
  PrismaRecommendationRepository,
  PrismaBookRepository,
  PrismaUserRepository,
  PrismaReadingProgressRepository,
  PrismaBookLikeRepository,
  PrismaTagRepository,
  PrismaGenreRepository,
  PrismaAuthorRepository,
} from '@read-n-feed/data-access';

import { RecommendationController } from './recommendation.controller';

@Module({
  controllers: [RecommendationController],
  providers: [
    // Application Use Cases
    RecommendationUseCase,

    // Domain Repositories
    {
      provide: 'IRecommendationRepository',
      useClass: PrismaRecommendationRepository,
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
      provide: 'IReadingProgressRepository',
      useClass: PrismaReadingProgressRepository,
    },
    {
      provide: 'IBookLikeRepository',
      useClass: PrismaBookLikeRepository,
    },
    {
      provide: 'ITagRepository',
      useClass: PrismaTagRepository,
    },
    {
      provide: 'IGenreRepository',
      useClass: PrismaGenreRepository,
    },
    {
      provide: 'IAuthorRepository',
      useClass: PrismaAuthorRepository,
    },
  ],
})
export class RecommendationModule {}
