import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from './raw-scraped-product.interface';

export interface ScraperAdapter {
  readonly sourceWebsite: string;

  canHandle(sourceWebsite: string): boolean;

  scrapeProducts(params: StartScrapeJobDto): Promise<RawScrapedProduct[]>;
}
