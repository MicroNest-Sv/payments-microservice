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
      case 'payment_intent.succeeded': {
        // Se dispara una sola vez cuando el pago se resuelve exitosamente,
        // sin importar cuántos intentos de cobro (charges) haya tomado.
        // Nota: charge.succeeded se dispara por cada cobro individual exitoso,
        // lo que podría causar procesamiento duplicado en caso de reintentos.
        const paymentIntent = event.data.object;
        this.logger.log(
          `Payment succeeded for order: ${paymentIntent.metadata?.orderId}`,
        );
        // TODO: actualizar orden en BD, notificar por NATS, etc.
        return { status: 'succeeded', paymentIntentId: paymentIntent.id };
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
        return { status: 'unhandled', type: event.type };
    }
  }
}
