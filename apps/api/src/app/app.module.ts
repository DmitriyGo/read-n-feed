import { Module } from '@nestjs/common';
import { DataAccessModule } from '@read-n-feed/data-access';

import { AuthModule } from './auth/auth.module';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { BookFileModule } from './book-file/book-file.module';
import { BookRequestModule } from './book-request/book-request.module';
import { CommentModule } from './comment/comment.module';
import { ApiConfigModule } from './config/config.module';
import { GenreModule } from './genre/genre.module';
import { LoggerModule } from './logger/logger.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ApiConfigModule.forRoot({ global: true }),
    LoggerModule.forRoot({ global: true }),
    DataAccessModule,
    AuthModule,
    UserModule,
    BookModule,
    BookRequestModule,
    BookFileModule,
    CommentModule,
    AuthorModule,
    GenreModule,
    TagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
