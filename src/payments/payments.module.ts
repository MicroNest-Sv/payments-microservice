import { forwardRef, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { StripeModule } from '@src/stripe/stripe.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { appConfig, NATS_SERVICE } from '@src/config';

@Module({
  imports: [
    forwardRef(() => StripeModule),

    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        inject: [appConfig.KEY],
        useFactory: (config: ConfigType<typeof appConfig>) => ({
          transport: Transport.NATS,
          options: {
            servers: config.natsServers,
          },
        }),
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
