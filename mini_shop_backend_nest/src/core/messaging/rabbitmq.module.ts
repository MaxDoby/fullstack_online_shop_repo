import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { createRabbitmqOptions } from './rabbitmq.options';

interface RabbitmqQueueModuleOptions {
  clientName: string;
  queueConfigKey: string;
}

@Module({})
export class RabbitmqModule {
  public static registerQueue(
    options: RabbitmqQueueModuleOptions,
  ): DynamicModule {
    const clientModule = ClientsModule.registerAsync([
      {
        name: options.clientName,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) =>
          createRabbitmqOptions(configService, options.queueConfigKey),
      },
    ]);

    return {
      module: RabbitmqModule,
      imports: [clientModule],
      exports: [clientModule],
    };
  }
}
