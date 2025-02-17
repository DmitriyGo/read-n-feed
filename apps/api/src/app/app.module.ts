import { Module } from '@nestjs/common';
import { DataAccessModule } from '@read-n-feed/data-access';

import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { ApiConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ApiConfigModule.forRoot({ global: true }),
    LoggerModule.forRoot({ global: true }),
    DataAccessModule,
    AuthModule,
    UserModule,
    BookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
