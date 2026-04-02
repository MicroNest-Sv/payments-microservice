import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { stripeConfig } from './config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [ConfigModule.forFeature(stripeConfig)],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
