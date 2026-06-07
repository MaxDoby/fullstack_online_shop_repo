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

@Module({
  imports: [AuthModule],
  controllers: [ScraperController],
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
    {
      provide: SCRAPER_ADAPTERS,
      useFactory: (ultraAdapter: UltraSearchAdapter) => [ultraAdapter],
      inject: [UltraSearchAdapter],
    },
  ],
})
export class ScraperModule {}
