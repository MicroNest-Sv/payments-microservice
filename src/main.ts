import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { appConfig } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const appConfigValues = appConfig();

  const app = await NestFactory.create(AppModule);

  await app.listen(appConfigValues.port);

  // logger.log(
  //   `Payments Microservice running on NATS servers: ${appConfigValues.natsServers.join(', ')}`,
  // );
  logger.log(`Payments Microservice running at ${await app.getUrl()}`);
}

void bootstrap();
