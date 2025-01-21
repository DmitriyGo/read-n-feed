import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDefined } from '@read-n-feed/shared';

import { EnvironmentValidation } from './config.schema';

@Injectable()
export class ApiConfigService {
  constructor(public readonly configService: ConfigService) {}

  public get<K extends keyof EnvironmentValidation>(
    propertyPath: K,
  ): EnvironmentValidation[K] {
    const value =
      this.configService.get<EnvironmentValidation[K]>(propertyPath);

    if (!isDefined(value)) {
      throw new Error(`Invalid schema provided for ${propertyPath}`);
    }

    return value;
  }
}
