import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8001),

  MONGODB_URI: z.string().min(1),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // WebSocket
  WS_ENABLED: z.coerce.boolean().default(true),

  // CORS
  CORS_ORIGINS: z.string().default('*'),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  LOG_LEVEL: process.env.LOG_LEVEL,
  WS_ENABLED: process.env.WS_ENABLED,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
});
