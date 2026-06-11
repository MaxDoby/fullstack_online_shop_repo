import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { RmqOptions } from '@nestjs/microservices';
import { createRabbitmqOptions } from './core/messaging/rabbitmq.options';
import { SCRAPER_QUEUE_CONFIG_KEY } from './modules/scraper/queue/scraper-queue.constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalFilters(new HttpExceptionFilter());

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

  await app.listen(configService.getOrThrow<number>('PORT'));

  void app
    .startAllMicroservices()
    .then(() => logger.log('RabbitMQ microservice started.'))
    .catch((error: unknown) => {
      logger.error(
        'RabbitMQ microservice failed to start.',
        error instanceof Error ? error.stack : String(error),
      );
    });
}
void bootstrap();
