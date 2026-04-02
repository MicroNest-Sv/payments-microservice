import { registerAs } from '@nestjs/config';
import z from 'zod';

import { EnvValidationError } from '@src/common/exceptions';

const appEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().nonempty('STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .nonempty('STRIPE_WEBHOOK_SECRET is required'),
  STRIPE_SUCCESS_URL: z.string().url('STRIPE_SUCCESS_URL must be a valid URL'),
  STRIPE_CANCEL_URL: z.string().url('STRIPE_CANCEL_URL must be a valid URL'),
});

type StripeEnv = z.infer<typeof appEnvSchema>;

export interface StripeConfig {
  stripeSecretKey: string;
  webhookSecret: string;
  successUrl: string;
  cancelUrl: string;
}

export default registerAs('stripe', (): StripeConfig => {
  const parsed = appEnvSchema.safeParse(process.env);

  if (!parsed.success) throw new EnvValidationError(parsed.error.issues);

  const env: StripeEnv = parsed.data;

  return {
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    successUrl: env.STRIPE_SUCCESS_URL,
    cancelUrl: env.STRIPE_CANCEL_URL,
  };
});
