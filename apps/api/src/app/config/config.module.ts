import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvironmentValidationSchema } from './config.schema';
import { ApiConfigService } from './config.service';

export class ApiConfigModule {
  static forRoot({ global }: { global: boolean }): DynamicModule {
    return {
      global,
      module: ApiConfigModule,
      imports: [
        ConfigModule.forRoot({
          validate: (v: Record<string, unknown>) =>
            EnvironmentValidationSchema.parse(v),
        }),
      ],
      providers: [ApiConfigService],
      exports: [ApiConfigService],
    };
  }
}
