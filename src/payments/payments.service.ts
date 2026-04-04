import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Stripe from 'stripe';

import { NATS_SERVICE } from '@src/config';
import { StripeService } from '@src/stripe/stripe.service';

import { type CreatePaymentSessionDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,

    private readonly stripeService: StripeService,
  ) {}

  async createPayment(dto: CreatePaymentSessionDto) {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      dto.items.map((item) => ({
        price_data: {
          currency: dto.currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

    const session = await this.stripeService.createCheckoutSession({
      orderId: dto.orderId,
      currency: dto.currency,
      lineItems,
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;

        const charge = await this.stripeService.retrieveCharge(
          paymentIntent.latest_charge as string,
        );

        this.natsClient.emit('payment.succeeded', {
          orderId: paymentIntent.metadata?.orderId,
          paymentIntentId: paymentIntent.id,
          receiptUrl: charge.receipt_url,
        });

        return {
          status: 'succeeded',
          paymentIntentId: paymentIntent.id,
          receiptUrl: charge.receipt_url,
        };
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
        return { status: 'unhandled', type: event.type };
    }
  }
}
