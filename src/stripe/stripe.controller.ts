import { Controller, Headers, Post, RawBody } from '@nestjs/common';

import { PaymentsService } from '@src/payments/payments.service';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('webhook')
  handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripeService.constructWebhookEvent(rawBody, signature);
    return this.paymentsService.handleStripeEvent(event);
  }
}
