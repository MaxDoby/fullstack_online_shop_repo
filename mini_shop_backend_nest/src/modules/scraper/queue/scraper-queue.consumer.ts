import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ScraperService } from '../scraper.service';
import type { ScraperJobMessage } from './scraper-job-message.interface';
import { SCRAPER_JOB_PATTERN } from './scraper-queue.constants';

@Controller()
export class ScraperQueueConsumer {
  public constructor(private readonly scraperService: ScraperService) {}

  @EventPattern(SCRAPER_JOB_PATTERN)
  public async handleScraperJob(@Payload() message: ScraperJobMessage) {
    await this.scraperService.runJob(message.jobId, message.payload);
  }
}
