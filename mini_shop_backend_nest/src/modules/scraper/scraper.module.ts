import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { ProductScrapeNormalizer } from './normalizers/product-scrape.normalizer';
import { ProductScrapeImporter } from './importers/product-scrape.importer';
import { ProductMetadataScrapeImporter } from './importers/product-metadata-scrape.importer';
import { AuthModule } from '../auth/auth.module';
import { ScraperHttpClient } from './http/scraper-http.client';
import { ProductImageScrapeImporter } from './importers/product-image-scrape.importer';
import { StorageService } from '../../core/storage/storage.service';
import { ScraperRepository } from './scraper.repository';
import { RabbitmqModule } from '../../core/messaging/rabbitmq.module';
import {
  SCRAPER_QUEUE_CLIENT,
  SCRAPER_QUEUE_CONFIG_KEY,
} from './queue/scraper-queue.constants';
import { ScraperQueueProducer } from './queue/scraper-queue.producer';
import { ScraperQueueConsumer } from './queue/scraper-queue.consumer';
import { SearchDiscoveryService } from './discovery/search-discovery.service';
import { ProductLinkExtractor } from './extractors/product-link.extractor';
import { GenericProductExtractor } from './extractors/generic-product.extractor';
import { UniversalScraperEngine } from './engine/scraper-engine';
import { SourceSearchConfigService } from './config/source-search.config';
import { HtmlSearchStrategy } from './strategies/html-search.strategy';
import { JsonLdStrategy } from './strategies/json-ld.strategy';
import { ApiDiscoveryStrategy } from './strategies/api-discovery.strategy';
import { SourceProfileDiscoveryService } from './discovery/source-profile-discovery.service';
import { SourceProfileRepository } from './source-profile.repository';
import { PlaywrightSearchStrategy } from './strategies/playwright-search.strategy';
import { PlaywrightProductExtractor } from './extractors/playwright-product.extractor';
import { SearchDiscoveryPipeline } from './pipelines/search-discovery.pipeline';
import { ProductUrlExtractionPipeline } from './pipelines/product-url-extraction.pipeline';
import { ProductDetailsExtractionPipeline } from './pipelines/product-details-extraction.pipeline';
import { ProductValidationPipeline } from './pipelines/product-validation.pipeline';

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
    ProductScrapeNormalizer,
    ProductScrapeImporter,
    ProductMetadataScrapeImporter,
    ScraperHttpClient,
    ProductImageScrapeImporter,
    ScraperRepository,
    ScraperQueueProducer,
    SearchDiscoveryService,
    ProductLinkExtractor,
    GenericProductExtractor,
    PlaywrightProductExtractor,
    UniversalScraperEngine,
    SourceSearchConfigService,
    HtmlSearchStrategy,
    JsonLdStrategy,
    ApiDiscoveryStrategy,
    PlaywrightSearchStrategy,
    SourceProfileDiscoveryService,
    SourceProfileRepository,
    SearchDiscoveryPipeline,
    ProductUrlExtractionPipeline,
    ProductDetailsExtractionPipeline,
    ProductValidationPipeline,
  ],
})
export class ScraperModule {}
