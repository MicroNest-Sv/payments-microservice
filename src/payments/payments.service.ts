import { Injectable } from '@nestjs/common';

import { StripeService } from '@src/stripe/stripe.service';
import { type CreatePaymentSessionDto } from '@src/stripe/dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly stripeService: StripeService) {}

  createPayment(dto: CreatePaymentSessionDto) {
    return this.stripeService.createPaymentSession(dto);
  }
}
