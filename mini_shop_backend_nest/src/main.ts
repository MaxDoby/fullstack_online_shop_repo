import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { RmqOptions } from '@nestjs/microservices';
import { createRabbitmqOptions } from './core/messaging/rabbitmq.options';
import { SCRAPER_QUEUE_CONFIG_KEY } from './modules/scraper/queue/scraper-queue.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const swaggerConfig: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Online Shop Api')
    .setDescription('API documentation for Online Shop backend.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument: OpenAPIObject = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  const rabbitMqOptions: RmqOptions = createRabbitmqOptions(
    configService,
    SCRAPER_QUEUE_CONFIG_KEY,
  );

  app.connectMicroservice<RmqOptions>(rabbitMqOptions);

  await app.startAllMicroservices();

  await app.listen(configService.getOrThrow<number>('PORT'));
}
void bootstrap();
