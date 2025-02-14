import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDefined } from '@read-n-feed/shared';

import { EnvironmentValidation } from './config.schema';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get<K extends keyof EnvironmentValidation>(
    key: K,
  ): EnvironmentValidation[K] {
    const value = this.configService.get<EnvironmentValidation[K]>(key);
    if (!isDefined(value)) {
      throw new Error(`Missing config for ${String(key)}`);
    }
    return value;
  }
}
