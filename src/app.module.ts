import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
    }),
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
