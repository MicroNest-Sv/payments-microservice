import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import Stripe from 'stripe';

import { stripeConfig } from './config';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    private readonly stripeConfigValues: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(stripeConfigValues.stripeSecretKey);
  }

  async createCheckoutSession(params: {
    orderId: string;
    currency: string;
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: { orderId: params.orderId },
      },
      line_items: params.lineItems,
      mode: 'payment',
      success_url: `${this.stripeConfigValues.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: this.stripeConfigValues.cancelUrl,
    });

    return session;
  }

  async retrieveCharge(chargeId: string) {
    return this.stripe.charges.retrieve(chargeId);
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.stripeConfigValues.webhookSecret,
    );
  }
}
