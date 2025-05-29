import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z
      .string()
      .optional()
      .default('http://localhost:3001/api/v1/'),
    VITE_ADMIN_EMAIL: z.string().optional().default('yaroslav.syvukha@nure.ua'),
  },
  runtimeEnv: import.meta.env,
});
