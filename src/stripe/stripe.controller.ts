import {
  Body,
  Controller,
  Headers,
  Post,
  RawBody,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { StripeService } from './stripe.service';
import { CreatePaymentSessionDto } from './dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createPaymentSession(@Body() dto: CreatePaymentSessionDto) {
    return this.stripeService.createPaymentSession(dto);
  }

  @Post('webhook')
  handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeService.handleWebhook(rawBody, signature);
  }
}
