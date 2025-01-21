import * as z from 'zod';

import { ConfigKeys } from './config-keys.enum';

export const EnvironmentValidationSchema = z.object({
  [ConfigKeys.NODE_ENV]: z
    .enum(['development', 'production'])
    .default('development'),
  [ConfigKeys.PORT]: z.preprocess(
    (a) => parseInt(a as string, 10) || 3001,
    z.number(),
  ),

  // Authentication
  // [ConfigKeys.JWT_SECRET]: z.string(),
  // [ConfigKeys.JWT_EXP]: z.string(),

  // Logging
  [ConfigKeys.PINO_LOG_LEVEL]: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
});

export type EnvironmentValidation = z.infer<typeof EnvironmentValidationSchema>;
