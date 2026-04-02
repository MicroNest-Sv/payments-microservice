import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { CreatePaymentSessionDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createPayment(@Body() dto: CreatePaymentSessionDto) {
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
}
