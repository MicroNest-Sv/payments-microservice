import { NestFactory } from '@nestjs/core';
import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';

import { appConfig } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const appConfigValues = appConfig();

  // Crear la app HTTP (necesaria para webhooks de Stripe)
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Conectar el transporte NATS como microservicio híbrido
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: appConfigValues.natsServers,
      },
    },
    { inheritAppConfig: true },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const extractMessages = (
          errors: import('class-validator').ValidationError[],
        ): string[] =>
          errors.flatMap((error) => [
            ...Object.values(error.constraints ?? {}),
            ...extractMessages(error.children ?? []),
          ]);

        return new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: extractMessages(errors),
        });
      },
    }),
  );

  // Iniciar todos los microservicios conectados (NATS) y luego el HTTP
  await app.startAllMicroservices();
  await app.listen(appConfigValues.port);

  logger.log(`Payments Microservice running at ${await app.getUrl()}`);
  logger.log(
    `Payments Microservice running on NATS servers: ${appConfigValues.natsServers.join(', ')}`,
  );
}

void bootstrap();
