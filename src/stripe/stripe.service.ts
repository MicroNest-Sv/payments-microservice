import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import Stripe from 'stripe';

import { stripeConfig } from './config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    stripeConfigValues: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(stripeConfigValues.stripeSecretKey);
  }
}
