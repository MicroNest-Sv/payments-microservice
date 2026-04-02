import { registerAs } from '@nestjs/config';
import z from 'zod';

import { EnvValidationError } from '@src/common/exceptions';

const appEnvSchema = z.object({
  DATABASE_URL: z.url(),
  NATS_SERVERS: z
    .string()
    .transform((str) => str.split(',').map((s) => s.trim())),
});

type AppEnv = z.infer<typeof appEnvSchema>;

export interface AppConfig {
  databaseUrl: string;
  natsServers: string[];
}

export default registerAs('app', (): AppConfig => {
  const parsed = appEnvSchema.safeParse(process.env);

  if (!parsed.success) throw new EnvValidationError(parsed.error.issues);

  const env: AppEnv = parsed.data;

  return {
    databaseUrl: env.DATABASE_URL,
    natsServers: env.NATS_SERVERS,
  };
});
