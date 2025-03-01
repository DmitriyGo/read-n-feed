import { Module } from '@nestjs/common';
import { CommentUseCase } from '@read-n-feed/application';
import {
  PrismaBookCommentRepository,
  PrismaBookRepository,
  PrismaUserRepository,
} from '@read-n-feed/data-access';

import { CommentController } from './comment.controller';

@Module({
  controllers: [CommentController],
  providers: [
    // Application Use Cases
    CommentUseCase,

    // Domain Repositories
    {
      provide: 'IBookRepository',
      useClass: PrismaBookRepository,
    },
    {
      provide: 'IBookCommentRepository',
      useClass: PrismaBookCommentRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class CommentModule {}
