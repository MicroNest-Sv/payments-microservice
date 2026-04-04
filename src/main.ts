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

  // 1. Crear la app HTTP (necesaria para webhooks de Stripe)
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // 2. Conectar el transporte NATS como microservicio híbrido
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: appConfigValues.natsServers,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints ?? {}).join(', '),
        );
        return new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: messages,
        });
      },
    }),
  );

  // 3. Iniciar todos los microservicios conectados (NATS) y luego el HTTP
  await app.startAllMicroservices();
  await app.listen(appConfigValues.port);

  logger.log(`Payments Microservice running at ${await app.getUrl()}`);
  logger.log(
    `Payments Microservice running on NATS servers: ${appConfigValues.natsServers.join(', ')}`,
  );
}

void bootstrap();
