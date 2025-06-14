import { Module } from '@nestjs/common';
import { DataAccessModule } from '@read-n-feed/data-access';

import { AuthModule } from './auth/auth.module';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { BookFileModule } from './book-file/book-file.module';
import { BookFileRequestModule } from './book-file-request/book-file-request.module';
import { BookImageRequestModule } from './book-image-request/book-image-request.module';
import { BookRequestModule } from './book-request/book-request.module';
import { CommentModule } from './comment/comment.module';
import { ApiConfigModule } from './config/config.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { GenreModule } from './genre/genre.module';
import { LoggerModule } from './logger/logger.module';
import { ReadingProgressModule } from './reading-progress/reading-progress.module';
import { RecommendationModule } from './recommendation/recommendation.module';
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
    ReadingProgressModule,
    BookRequestModule,
    BookFileModule,
    BookFileRequestModule,
    BookImageRequestModule,
    CommentModule,
    AuthorModule,
    GenreModule,
    TagModule,
    RecommendationModule,
    FileUploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
