import { registerAs } from '@nestjs/config';
import z from 'zod';

import { EnvValidationError } from '@src/common/exceptions';

const appEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().nonempty('STRIPE_SECRET_KEY is required'),
});

type StripeEnv = z.infer<typeof appEnvSchema>;

export interface StripeConfig {
  stripeSecretKey: string;
}

export default registerAs('stripe', (): StripeConfig => {
  const parsed = appEnvSchema.safeParse(process.env);

  if (!parsed.success) throw new EnvValidationError(parsed.error.issues);

  const env: StripeEnv = parsed.data;

  return {
    stripeSecretKey: env.STRIPE_SECRET_KEY,
  };
});
