import { ConfigService } from '@nestjs/config';
import { Transport, type RmqOptions } from '@nestjs/microservices';
import { RABBITMQ_URL_CONFIG_KEY } from './rabbitmq.constants';

export const createRabbitmqOptions = (
  configService: ConfigService,
  queueConfigKey: string,
): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [configService.getOrThrow<string>(RABBITMQ_URL_CONFIG_KEY)],
    queue: configService.getOrThrow<string>(queueConfigKey),
    queueOptions: {
      durable: true,
    },
  },
});
