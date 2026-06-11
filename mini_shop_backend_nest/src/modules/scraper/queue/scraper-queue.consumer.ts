import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ScraperService } from '../scraper.service';
import type { ScraperJobMessage } from './scraper-job-message.interface';
import { SCRAPER_JOB_PATTERN } from './scraper-queue.constants';

@Controller()
export class ScraperQueueConsumer {
  public constructor(private readonly scraperService: ScraperService) {}

  private readonly logger = new Logger(ScraperQueueConsumer.name);

  @EventPattern(SCRAPER_JOB_PATTERN)
  public async handleScraperJob(@Payload() message: ScraperJobMessage) {
    this.logger.log(`Received scraper job ${message.jobId} from RabbitMQ.`);

    await this.scraperService.runJob(message.jobId, message.payload);

    this.logger.log(`Finished scraper job ${message.jobId} from RabbitMQ.`);
  }
}
