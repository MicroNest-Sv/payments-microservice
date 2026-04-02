import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import Stripe from 'stripe';

import { stripeConfig } from './config';
import { type CreatePaymentSessionDto } from './dto';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  private readonly stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    private readonly stripeConfigValues: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(stripeConfigValues.stripeSecretKey);
  }

  async createPaymentSession(dto: CreatePaymentSessionDto) {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      dto.items.map((item) => ({
        price_data: {
          currency: dto.currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100), // convertir a centavos
        },
        quantity: item.quantity,
      }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: { orderId: dto.orderId },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.stripeConfigValues.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: this.stripeConfigValues.cancelUrl,
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.stripeConfigValues.webhookSecret,
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        this.logger.log(
          `Payment completed for session ${session.id}, orderId: ${session.payment_intent}`,
        );
        return { status: 'completed', sessionId: session.id };
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        this.logger.warn(`Payment session expired: ${session.id}`);
        return { status: 'expired', sessionId: session.id };
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
        return { status: 'unhandled', type: event.type };
    }
  }
}
