import { Inject, Injectable } from '@nestjs/common';
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

  public async publishScraperJob(message: ScraperJobMessage): Promise<void> {
    await firstValueFrom(this.client.emit(SCRAPER_JOB_PATTERN, message));
  }
}
