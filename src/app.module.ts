import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config';
import { PaymentsModule } from './payments/payments.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
    }),
    PaymentsModule,
    StripeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
