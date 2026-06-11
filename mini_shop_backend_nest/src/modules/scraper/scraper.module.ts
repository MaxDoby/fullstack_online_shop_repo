import { Module } from '@nestjs/common';
import { ScraperRegistryService } from './scraper-registry.service';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SCRAPER_ADAPTERS } from './constants/scraper-adapters.token';
import { ProductScrapeNormalizer } from './normalizers/product-scrape.normalizer';
import { ProductScrapeImporter } from './importers/product-scrape.importer';
import { ProductMetadataScrapeImporter } from './importers/product-metadata-scrape.importer';
import { AuthModule } from '../auth/auth.module';
import { ScraperHttpClient } from './http/scraper-http.client';
import { ProductImageScrapeImporter } from './importers/product-image-scrape.importer';
import { StorageService } from '../../core/storage/storage.service';
import { UltraSearchAdapter } from './adapters/ultra/ultra-search.adapter';
import { UltraProductParser } from './adapters/ultra/ultra-product.parser';
import { ScraperRepository } from './scraper.repository';
import { RabbitmqModule } from '../../core/messaging/rabbitmq.module';
import {
  SCRAPER_QUEUE_CLIENT,
  SCRAPER_QUEUE_CONFIG_KEY,
} from './queue/scraper-queue.constants';
import { ScraperQueueProducer } from './queue/scraper-queue.producer';
import { ScraperQueueConsumer } from './queue/scraper-queue.consumer';

@Module({
  imports: [
    AuthModule,
    RabbitmqModule.registerQueue({
      clientName: SCRAPER_QUEUE_CLIENT,
      queueConfigKey: SCRAPER_QUEUE_CONFIG_KEY,
    }),
  ],
  controllers: [ScraperController, ScraperQueueConsumer],
  providers: [
    ScraperService,
    StorageService,
    ScraperRegistryService,
    ProductScrapeNormalizer,
    ProductScrapeImporter,
    ProductMetadataScrapeImporter,
    ScraperHttpClient,
    ProductImageScrapeImporter,
    UltraSearchAdapter,
    UltraProductParser,
    ScraperRepository,
    ScraperQueueProducer,
    {
      provide: SCRAPER_ADAPTERS,
      useFactory: (ultraAdapter: UltraSearchAdapter) => [ultraAdapter],
      inject: [UltraSearchAdapter],
    },
  ],
})
export class ScraperModule {}
