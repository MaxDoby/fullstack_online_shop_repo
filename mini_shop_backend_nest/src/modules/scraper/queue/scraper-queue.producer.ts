import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { ScraperJobMessage } from './scraper-job-message.interface';
import {
  SCRAPER_JOB_PATTERN,
  SCRAPER_QUEUE_CLIENT,
} from './scraper-queue.constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScraperQueueProducer {
  public constructor(
    @Inject(SCRAPER_QUEUE_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  private readonly logger = new Logger(ScraperQueueProducer.name);

  public async publishScraperJob(message: ScraperJobMessage): Promise<void> {
    this.logger.log(`Publishing scraper job ${message.jobId} to RabbitMQ`);

    await firstValueFrom(this.client.emit(SCRAPER_JOB_PATTERN, message));

    this.logger.log(`Scraper job ${message.jobId} was published to RabbitMQ.`);
  }
}
