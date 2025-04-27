import { Module } from '@nestjs/common';
import { CommentUseCase, UserUseCase } from '@read-n-feed/application';
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
    UserUseCase,

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
