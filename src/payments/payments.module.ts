import { forwardRef, Module } from '@nestjs/common';

import { StripeModule } from '@src/stripe/stripe.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [forwardRef(() => StripeModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
