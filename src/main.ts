import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { appConfig } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const appConfigValues = appConfig();

  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        // const messages = errors.map((error) =>
        //   Object.values(error.constraints ?? {}).join(', '),
        // );
        // return new RpcException({
        //   status: HttpStatus.BAD_REQUEST,
        //   message: messages,
        // });
      },
    }),
  );

  await app.listen(appConfigValues.port);

  // logger.log(
  //   `Payments Microservice running on NATS servers: ${appConfigValues.natsServers.join(', ')}`,
  // );
  logger.log(`Payments Microservice running at ${await app.getUrl()}`);
}

void bootstrap();
