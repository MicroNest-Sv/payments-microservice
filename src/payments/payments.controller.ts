import { Controller, Get, Post } from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')
  createPayment() {
    return this.paymentsService.createPayment();
  }

  @Get('success')
  getSuccess() {
    return { message: 'Payment successful' };
  }

  @Get('failure')
  getFailure() {
    return { message: 'Payment failed' };
  }

  @Get('cancelled')
  getCancelled() {
    return { message: 'Payment cancelled' };
  }

  @Post('webhook')
  handleWebhook() {
    // Aquí iría la lógica para manejar el webhook de pagos
    return { message: 'Webhook received' };
  }
}
