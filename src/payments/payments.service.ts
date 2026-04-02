import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { StripeService } from '@src/stripe/stripe.service';
import { type CreatePaymentSessionDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly stripeService: StripeService) {}

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

  handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        this.logger.log(
          `Payment completed for order: ${session.metadata?.orderId}`,
        );
        // TODO: actualizar orden en BD, notificar por NATS, etc.
        return { status: 'completed', sessionId: session.id };
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        this.logger.warn(`Payment expired for session: ${session.id}`);
        // TODO: marcar orden como expirada
        return { status: 'expired', sessionId: session.id };
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
        return { status: 'unhandled', type: event.type };
    }
  }
}
