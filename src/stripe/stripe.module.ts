import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { stripeConfig } from './config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule.forFeature(stripeConfig)],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
