import * as z from 'zod';

import { ConfigKeys } from './config-keys.enum';

export const EnvironmentValidationSchema = z.object({
  [ConfigKeys.NODE_ENV]: z
    .enum(['development', 'production'])
    .default('development'),

  [ConfigKeys.PORT]: z.preprocess(
    (v) => parseInt(v as string, 10) || 3001,
    z.number(),
  ),

  // JWT secret must be a non-empty string
  [ConfigKeys.JWT_SECRET]: z
    .string()
    .min(1, 'JWT_SECRET cannot be empty')
    .default('your_fallback_secret'),

  // JWT expiration can be e.g. 15m, 1h, etc
  [ConfigKeys.JWT_EXP]: z
    .string()
    .min(1, 'JWT_EXP cannot be empty')
    .default('15m'),

  // Refresh token max age in days (30 by default).
  [ConfigKeys.REFRESH_TOKEN_MAX_AGE_DAYS]: z.preprocess(
    (v) => parseInt(v as string, 10) || 30,
    z.number().positive().max(60),
  ),

  [ConfigKeys.DATABASE]: z.string().optional(),
  [ConfigKeys.FRONTEND_URL]: z.string().url().optional(),

  // Logging level
  [ConfigKeys.PINO_LOG_LEVEL]: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
});

export type EnvironmentValidation = z.infer<typeof EnvironmentValidationSchema>;
