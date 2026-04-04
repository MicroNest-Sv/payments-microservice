import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreatePaymentSessionDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // --- HTTP endpoints (Stripe webhooks, redirects) ---

  @Post('create-payment')
  createPaymentHttp(@Body() dto: CreatePaymentSessionDto) {
    return this.paymentsService.createPayment(dto);
  }

  @Get('success')
  getSuccess() {
    return { message: 'Payment successful' };
  }

  @Get('cancel')
  getCancel() {
    return { message: 'Payment cancelled' };
  }

  // --- NATS message handlers (inter-service communication) ---

  @MessagePattern('payments.create')
  createPaymentNats(@Payload() dto: CreatePaymentSessionDto) {
    return this.paymentsService.createPayment(dto);
  }
}
