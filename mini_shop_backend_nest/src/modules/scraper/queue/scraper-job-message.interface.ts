import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';

export interface ScraperJobMessage {
  jobId: number;
  payload: StartScrapeJobDto;
}
